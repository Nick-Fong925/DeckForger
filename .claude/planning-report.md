# DeckForge — Planning Report

## Overview

DeckForge is a full-stack flashcard app with two modes of operation: **AI generation** (upload a PDF or PPTX, extract text, call Claude API, produce a deck) and **direct import** (upload a CSV or `.apkg` file, parse cards directly, no LLM needed). Cards are stored as Firestore documents. Users study in-app with multiple game modes. The app is being built as a structured learning vehicle for TypeScript, Express, React, Firebase Auth, Firestore, and GCP infrastructure.

The core pipeline is async: upload → process → study. For AI-generated decks, "process" means extract → generate. For imports, "process" means parse directly. Both paths converge on the same cards JSON in Supabase and the same in-app study experience.

---

## Minimum Viable Validation

**The smallest thing that proves the core assumption:** upload a PDF, get a deck of correct flashcards, study them in the browser.

This can be validated entirely locally before any GCP infrastructure exists:
- Upload a PDF via curl
- Run the extractor and generator Python scripts manually in sequence
- Open the browser, navigate to the deck, flip through cards

Cost: zero. Failure here means the Claude API prompt needs tuning or the text extraction is losing structure — both fixable before any infrastructure investment.

---

## Feasibility Assessment

**Technical:** Fully feasible. PyMuPDF, python-pptx, and the Anthropic SDK are all stable and well-documented. `.apkg` parsing requires only Python's built-in `zipfile` + `sqlite3` modules — no third-party library. CSV parsing is trivial. The TypeScript monorepo pattern with shared Zod schemas is a proven approach.

**Operational:** Local development is straightforward. GCP migration adds complexity (Dockerfiles, IAM, Secret Manager) but is well-documented and the scope is bounded.

**Economic:** Anthropic API costs are the only meaningful variable cost. At typical flashcard density (~20-30 cards per document), Claude Sonnet costs are low per document. CSV and `.apkg` imports have zero API cost. Supabase and Firebase free tiers cover development and light production usage.

**Legal/regulatory:** No significant concerns. The app processes user-uploaded files and calls the Anthropic API. Standard data handling practices apply.

**Uncertain facts to verify before production:**
- GCS signed URL expiry times and whether they are appropriate for the expected upload window
- Firestore Security Rules behavior with Admin SDK (Admin SDK bypasses rules by design — ownership must be enforced in route handlers)
- Cloud Run Job cold start times and whether they affect perceived UX

---

## Key Considerations

**Firestore and Firebase Auth are the same ecosystem.** Firebase Auth UIDs are first-class in Firestore Security Rules — `request.auth.uid` enforces ownership at the DB layer. The server uses the Firebase Admin SDK, which bypasses Security Rules by design. This means the server is still the security boundary for all write operations; always filter reads and writes by `req.user.uid` in route handlers.

**The webhook pattern is the load-bearing architectural seam.** Whether jobs run via `child_process.spawn()` locally or Cloud Run in production, the interface is identical: job completes, calls `POST /webhooks/job-complete`, server advances the pipeline. Keep this interface clean from day one so the GCP migration is a deployment change, not a code change.

**Local-first development is the right sequencing.** Validating the full pipeline locally before deploying eliminates an entire class of bugs (is this broken because of my code, or because of my infra config?). GCP infrastructure should be added only after the local pipeline produces a correct deck viewable in the browser.

**Zod shared schemas are the glue.** The `packages/shared` package ensures that validation logic is written once and enforced at both the API boundary and in the frontend. This is the most important TypeScript learning pattern in the project — understand it deeply in Phase 1.

---

## Technology Recommendations

**Monorepo tooling: npm workspaces** (not Turborepo or nx yet). Reason: workspaces are built into npm, zero config, and sufficient for three packages. Adding a build orchestrator is complexity that doesn't pay off until you have a CI pipeline with multiple build targets. Revisit when you have more than 5 packages or meaningful build caching needs.

**Firestore: use the real Firebase project from day one.** The Firestore emulator adds local setup friction. The hosted free tier is generous (50k reads/day, 20k writes/day), always available, and is what production will use anyway.

**Firebase Auth: use the real Firebase project locally.** The Firebase emulator suite is useful for CI but adds local setup complexity. For a learning project, using the real Firebase project locally is fine.

**Python job runner (local): `child_process.spawn()` in Node.** Simple, no extra dependencies. The webhook callback from the job back to Express is what matters — keep that interface clean so Cloud Run is a drop-in replacement.

**Frontend state: React Query.** Reason: upload status needs polling (the pipeline is async), and React Query's refetch intervals and stale-while-revalidate behavior handle this cleanly. Context/Redux would require manual polling logic.

**Card storage: Firestore document with a `cards` array field.** Cards are never queried individually — they're always fetched as a complete deck. A single Firestore document per deck is the right fit. No separate collection needed.

---

## File Type Pipelines

The upload file type determines which pipeline runs. Both paths produce the same output: a `cards` JSON array written to a Firestore `decks` document.

```
PDF / PPTX  →  extractor job  →  generator job  →  deck complete
CSV         →  extractor job (parse directly)   →  deck complete
.apkg       →  extractor job (unzip + sqlite3)  →  deck complete
```

The extractor job handles all four file types. For CSV and `.apkg`, it skips GCS intermediate storage and calls the webhook directly with the parsed cards. The generator job is only triggered for PDF/PPTX.

**Status flow by file type:**

| File type | Status progression |
|---|---|
| PDF / PPTX | `uploaded` → `extracting` → `generating` → `complete` |
| CSV | `uploaded` → `extracting` → `complete` |
| `.apkg` | `uploaded` → `extracting` → `complete` |

**Export:** Decks can be downloaded as CSV (generated on the fly by Express from the Firestore document — no Python job, no GCS write). This CSV is importable into Anki, Quizlet, or any other flashcard tool.

---

## Performance & Feasibility Constraints

The pipeline is inherently async and user-perceived latency is dominated by the Claude API call time (typically 5-30 seconds depending on document length). CSV and `.apkg` imports complete in under a second.

**There is no meaningful performance constraint to optimize for in the MVP.** The app is not latency-sensitive — users upload a file and come back when it's done. Status polling every 3-5 seconds via React Query is sufficient UX.

When running locally, `child_process.spawn()` adds no meaningful overhead vs. Cloud Run. When moving to Cloud Run, cold starts (~1-3 seconds) are acceptable given the async nature of the pipeline.

**TypeScript compilation:** Use `tsc --noEmit` for type checking and `tsx` for local development. Avoid premature optimization of the build pipeline.

---

## Implementation Trade-offs

**Signed URL upload (plan) vs. server-proxied upload (simpler locally)**

The plan calls for client → GCS direct upload via signed URL. Locally, this is replaced by `multer` (server receives the file). This is the right trade-off: signed URLs are the correct production pattern (avoids routing large files through your server), but `multer` is faster to implement and good enough locally. The server route interface (`POST /uploads/init` returning an upload target) stays the same — only the destination changes.

**Two separate Cloud Run Jobs (extractor, generator) vs. one combined job**

The packager job has been eliminated. The extractor and generator remain discrete jobs for PDF/PPTX. This is correct for production (independent scaling, isolated failure domains). For CSV and `.apkg` imports, only the extractor runs. Do not merge them — the boundary is what you're learning.

**Firebase Admin SDK bypasses Firestore Security Rules**

The Admin SDK is fully trusted and Security Rules are not enforced server-side. This is by design and the correct pattern — the server verifies the Firebase ID token, attaches `req.user.uid`, and filters all DB operations by that uid. Firestore Security Rules are a second layer of defense for any future direct-client access, but the server is the primary security boundary.

---

## Phased Implementation Plan

### Phase 1 — TypeScript monorepo + Zod schemas ✅
**Goal:** Understand how shared types flow across packages and how Zod enforces them at runtime.
**Work:**
- Initialize monorepo with npm workspaces
- Create `packages/shared` with all Zod schemas and exported TypeScript types
- Create `packages/server` with bare Express + one validated route importing from shared
**Success criteria:** `curl` a route with a malformed body, get a typed Zod error. Import a type from `shared` in `server` with full TypeScript autocomplete.
**Unlocks:** Every subsequent phase depends on the shared schemas being in place.

### Phase 2 — Firebase Auth middleware
**Goal:** Understand the JWT verification flow and the middleware pattern in Express.
**Work:**
- Set up a Firebase project, enable Google sign-in
- Add Firebase Admin SDK to the server
- Write `authenticate` middleware
- Add `POST /auth/register` endpoint
**Success criteria:** A request with no token gets 401. A request with a valid Firebase ID token gets the user's `firebase_uid` attached to `req.user`.
**Unlocks:** All protected routes.

### Phase 3 — Firestore integration
**Goal:** Understand Firestore collections, document structure, and the Admin SDK pattern.
**Work:**
- Define Firestore collections: `users`, `uploads`, `decks`
- Set Firestore Security Rules (read: owner only, write: server only via Admin SDK)
- Wire `GET /uploads` and `GET /decks` to return user-scoped documents
**Success criteria:** Creating a document via the server returns it in the GET. A document with a different `uid` is not returned.
**Unlocks:** Persistent state for the upload pipeline.

### Phase 4 — File upload flow (local disk)
**Goal:** Understand the upload → job trigger → webhook pattern end-to-end.
**Work:**
- Add `multer` to handle file uploads to local disk
- Implement `POST /uploads/init` (saves file, creates Firestore upload doc, detects file type, triggers extractor via `child_process.spawn()`)
- Implement `POST /webhooks/job-complete` (advances pipeline state, triggers generator if file type is PDF/PPTX)
**Success criteria:** Upload a PDF via curl, see status advance through `uploaded` → `extracting` in Firestore.
**Unlocks:** The Python job pipeline.

### Phase 5 — Python pipeline (local)
**Goal:** Validate the full pipeline for all input types.
**Work:**
- Build `extractor/main.py`:
  - PDF: PyMuPDF → `extracted.json` → triggers generator
  - PPTX: python-pptx → `extracted.json` → triggers generator
  - CSV: parse rows → cards JSON → webhook complete
  - `.apkg`: `zipfile` + `sqlite3` → cards JSON → webhook complete
- Build `generator/main.py` (PDF/PPTX only: Claude API → cards JSON → webhook complete)
- Each script calls `POST /webhooks/job-complete` on completion
**Success criteria:** Upload a PDF → cards appear in Firestore. Upload a CSV → cards appear instantly. Upload an `.apkg` → cards parsed correctly.
**Unlocks:** A fully working backend pipeline. All subsequent work is frontend or infrastructure.

### Phase 6 — React frontend
**Goal:** Build the UI on top of a validated API. Learn Firebase client SDK, React Query, protected routes.
**Work:**
- Firebase client auth (Google sign-in)
- Axios interceptor for token attachment
- React Query for status polling and data fetching
- Wire all pages to real API (replacing mock data)
- Study modes: Classic (built), Speed, Quiz
**Success criteria:** Full end-to-end flow in the browser without touching curl.
**Unlocks:** A usable product.

### Phase 7 — GCP migration
**Goal:** Understand what production infrastructure actually looks like. Learn GCS, Cloud Run, Secret Manager.
**Work:**
- Swap `multer` for GCS signed URL upload flow
- Containerize each Python job with Docker
- Deploy jobs to Cloud Run
- Wire Cloud Run job triggers from the Express server
- Move secrets to GCP Secret Manager
- Deploy Express server to Cloud Run
**Success criteria:** The full pipeline runs in GCP with no local processes.
**Unlocks:** A production-deployable app.

---

## Gotchas

**Gotcha 1: Firebase Admin SDK bypasses Firestore Security Rules.**
The Admin SDK is fully trusted — Security Rules do not apply to server-side reads and writes. This means a bug in a route handler can expose another user's data. Mitigation: always filter by `req.user.uid` in every Firestore query, never return unfiltered documents.

**Gotcha 2: The webhook pattern must be kept clean from day one.**
`child_process.spawn()` locally and Cloud Run jobs in production have the same interface: job calls `POST /webhooks/job-complete` when done. If you shortcut this locally (e.g., blocking `await` on the job instead of using the webhook), you will need to refactor before GCP migration. Keep the webhook interface even when running locally.

**Gotcha 3: Validating the Claude API prompt quality early.**
The biggest risk for AI-generated decks is the Claude API producing poor flashcards from real documents. Validate the extractor + generator pipeline locally against a real PDF before touching any infrastructure. If the flashcard quality is poor, the prompt needs work — that should be discovered cheaply, not after deploying to Cloud Run.

**Gotcha 4: `.apkg` format is a zipped SQLite database.**
Do not reach for a third-party library for `.apkg` parsing. Python's built-in `zipfile` extracts the archive and `sqlite3` reads the `notes` table. The relevant columns are `flds` (tab-separated front/back) and `mid` (note model). This is simpler than it sounds but requires reading Anki's schema once.

---

## Pending Deployment Steps

These are manual steps that must be completed before the app is production-ready. They cannot be automated by code changes alone.

- **Deploy Firestore Security Rules** — run `firebase deploy --only firestore:rules` once the Firebase CLI is set up. The rules file is at `firestore.rules` in the project root. Until deployed, the rules have no effect — the server is the only enforcement layer.
- **Set `WEBHOOK_SECRET` in all environments** — generate a long random string (e.g. `openssl rand -hex 32`) and set it in local `.env` and in Cloud Run secrets (Phase 7). Python jobs must pass this as `Authorization: Bearer <secret>` when calling `POST /webhooks/job-complete`.
- **Set `SERVER_URL` in production** — defaults to `http://localhost:8080` for local dev; must be set to the Cloud Run service URL in production so Python jobs can reach the webhook endpoint.

---

## Open Questions

- Should the app support re-generating a deck from an existing upload, or is each upload a one-time pipeline run?
- Is a user account system needed beyond Firebase UID, or is email the only user-facing identity?
- Should Speed mode be configurable (timer duration) or fixed?
- Should Quiz mode generate distractors from other cards in the same deck, or from all of the user's cards?
