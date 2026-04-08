# DeckForge — Auth Implementation Plan

## What This Document Covers

The complete auth flow for Phase 2, how `firebase_uid` threads through every data entity, where the security boundary sits, and the full impact of this change on each package.

---

## The Core Concept

Firebase Auth handles identity completely. The app never issues its own tokens, stores passwords, or manages sessions. Firebase gives the client a short-lived **ID token** (a signed JWT) that the server verifies using the Firebase Admin SDK. The UID inside that token is the ownership key for every piece of data in the system.

---

## Auth Flow — Step by Step

### Sign-In

```
Browser                          Firebase Auth               Server
  |                                   |                          |
  |-- signInWithPopup(googleProvider) |                          |
  |          (Google OAuth redirect)  |                          |
  |<----- User object + ID token -----|                          |
  |                                   |                          |
  |-- POST /auth/register             |                          |
  |   Authorization: Bearer <token>   |                          |
  |--------------------------------------------------------->    |
  |                                   |   verifyIdToken(token)   |
  |                                   |<-------------------------|
  |                                   |--- DecodedIdToken ------>|
  |                                   |                          |
  |<----------------------------------------- { firebase_uid,   |
  |                                              email }         |
```

**What happens in detail:**

1. User clicks "Continue with Google" on `LoginPage`
2. `signInWithPopup(auth, googleProvider)` opens the Google OAuth popup
3. Google redirects back with an authorization code; Firebase exchanges it for tokens
4. Firebase returns a `User` object to the client. The client now has:
   - `user.uid` — the stable, permanent `firebase_uid` (e.g. `"abc123xyz"`)
   - `user.email` — the user's Google account email
   - `user.getIdToken()` — an async method that returns the current ID token (JWT)
5. The client calls `POST /auth/register` with the token in the `Authorization` header
6. The server's `authenticate` middleware calls `adminAuth.verifyIdToken(token)`
7. Firebase Admin SDK cryptographically verifies the JWT signature against Firebase's public keys — no network call to Firebase needed after the first key fetch
8. If valid, the decoded payload is attached to `req.user` as `DecodedIdToken`
9. The route handler calls `authService.register(req.user)` → returns `{ firebase_uid, email }`
10. `AuthContext` stores the `User` object; `onAuthStateChanged` keeps it in sync across page reloads

### Every Subsequent Authenticated Request

```
Browser                                          Server
  |                                                 |
  |  Axios interceptor runs before every request    |
  |  user.getIdToken() → fresh JWT (auto-refreshed) |
  |-- GET /uploads                                  |
  |   Authorization: Bearer <fresh-token>  -------> |
  |                                        authenticate middleware
  |                                        verifyIdToken → req.user
  |                                        service filters by req.user.uid
  |<------- only this user's uploads --------------|
```

**Key point:** `user.getIdToken()` returns a cached token and only fetches a new one when the current token is within 5 minutes of expiry. ID tokens expire after 1 hour. This is handled entirely by the Firebase client SDK — the app never manually refreshes tokens.

### Sign-Out

```
Browser                          Firebase Auth
  |                                   |
  |-- signOut(auth) ----------------> |
  |                                   | invalidates local session
  |<-- onAuthStateChanged(null) ------|
  |
  AuthContext sets user = null
  ProtectedRoute redirects to /login
```

Sign-out is local only — it clears the client-side session. The ID token itself isn't revoked on Firebase's servers (that requires the Admin SDK and is a separate concern for production). For this app, clearing the local session is sufficient.

---

## The ID Token (JWT) — What's Inside

When `verifyIdToken` succeeds it returns a `DecodedIdToken`. The fields the app uses:

| Field | Value | Used for |
|---|---|---|
| `uid` | `"abc123xyz"` | Ownership key for all Firestore documents |
| `email` | `"user@gmail.com"` | Stored in the Firestore `users` doc |
| `exp` | Unix timestamp | Firebase SDK uses this to auto-refresh |
| `aud` | Firebase project ID | Admin SDK verifies this matches your project |
| `iss` | `"https://securetoken.google.com/<project>"` | Admin SDK verifies issuer |

The server never stores the token. It verifies, extracts `uid` and `email`, then discards it.

---

## How `firebase_uid` Threads Through the Data Model

Every entity in Firestore carries `firebase_uid`. This is the ownership field — the server filters every read and write by `req.user.uid`.

```
Firebase Auth
  └── uid: "abc123xyz"
         │
         ├── users/{uid}
         │     firebase_uid: "abc123xyz"
         │     email: "user@gmail.com"
         │     created_at: "..."
         │
         ├── uploads/{upload_id}
         │     firebase_uid: "abc123xyz"   ← ownership
         │     file_name: "biology.pdf"
         │     status: "complete"
         │     ...
         │
         └── decks/{deck_id}
               firebase_uid: "abc123xyz"   ← ownership
               upload_id: "..."
               title: "Biology Notes"
               cards: [...]
               ...
```

**Why every entity carries `firebase_uid` instead of just joining through the user doc:**
Firestore queries filter at the collection level. To fetch all uploads for a user, the query is:
```
db.collection('uploads').where('firebase_uid', '==', req.user.uid)
```
There's no SQL-style JOIN. Each document is self-contained with its owner.

**The Admin SDK security model:**
The Firebase Admin SDK on the server bypasses Firestore Security Rules entirely. This means a bug in a route handler — failing to filter by `req.user.uid` — would expose all users' data. The server is the security boundary. The rule:

> Every Firestore query in a route handler must include `.where('firebase_uid', '==', req.user.uid)`.

Firestore Security Rules are a second layer of defense for any direct client access, but the server must not rely on them.

---

## Component Responsibilities

### `packages/client`

| File | Responsibility |
|---|---|
| `lib/firebase.ts` | Initializes the Firebase app with client config (API key, auth domain, project ID). These are public values — safe to expose. |
| `lib/axios.ts` | Axios instance with a request interceptor. Before every API call, it calls `user.getIdToken()` and injects the Bearer token into the Authorization header. |
| `contexts/AuthContext.tsx` | Wraps `onAuthStateChanged` in React state. Provides `user`, `isLoading`, `signIn`, `signOut` to the component tree. This is the only place Firebase auth events are subscribed to. |
| `hooks/useAuth.ts` | Thin hook that reads from `AuthContext`. Throws if used outside the provider. This is the only import components need. |
| `components/ProtectedRoute.tsx` | Renders a loading state while auth resolves, redirects to `/login` if no user, renders children if authenticated. Wraps all non-login routes in `App.tsx`. |
| `pages/LoginPage.tsx` | Calls `signIn()` on button click. Redirects to `/dashboard` via `useEffect` if `user` is already set. |
| `layouts/RootLayout.tsx` | Adds a Sign Out button that calls `signOut()`. |

### `packages/server`

| File | Responsibility |
|---|---|
| `config/firebase.ts` | Lazily initializes Firebase Admin SDK on first auth check. Reads `FIREBASE_PROJECT_ID` and `FIREBASE_SERVICE_ACCOUNT_JSON` from env. Lazy init avoids dotenv ordering issues at module load time. |
| `types/index.ts` | Defines `AuthenticatedRequest = Request & { user: DecodedIdToken }`. Used in route handlers after `authenticate` runs. |
| `middleware/auth.ts` | Extracts the Bearer token from the Authorization header, calls `getAdminAuth().verifyIdToken()`, attaches `DecodedIdToken` to `req.user`, calls `next()`. Returns 401 if missing or invalid. |
| `middleware/asyncHandler.ts` | Wraps async route handlers so unhandled rejections route to the error middleware instead of crashing the process. |
| `middleware/validate.ts` | Middleware factory. Takes a Zod schema, parses `req.body`, calls `next(ValidationError)` on failure. Used for routes with request bodies. |
| `middleware/errorHandler.ts` | Defines `AppError`, `UnauthorizedError`, `ValidationError`, `NotFoundError`. The central error handler converts these to HTTP responses, sanitizes unknown errors in production. |
| `services/authService.ts` | `register(token: DecodedIdToken)` extracts `uid` and `email`. In Phase 2 it returns them directly. In Phase 3 it will upsert the `users/{uid}` Firestore document. |
| `routes/auth.ts` | `POST /auth/register` — protected by `authenticate`, delegates to `authService.register`. |

### `packages/shared`

No changes needed for Phase 2. The `userSchema` is already defined with `firebase_uid` and `email`. The `User` type will be used in Phase 3 when `authService.register` persists to Firestore and returns a full `User`.

---

## Security Boundary Diagram

```
Internet
   │
   ▼
Express server
   │
   ├── helmet()         — security headers
   ├── cors()           — origin policy
   ├── express.json()   — body parsing
   │
   ├── GET /health      — public, no auth
   │
   └── POST /auth/register
         │
         authenticate middleware
         │  ├── Missing header? → 401
         │  ├── Invalid token?  → 401
         │  └── Valid token?    → req.user = DecodedIdToken
         │
         asyncHandler
         │
         authService.register(req.user)
         │
         res.json({ firebase_uid, email })
```

In Phase 3+, every protected route follows this same pattern. The `authenticate` middleware is the gate — nothing past it can run without a verified Firebase ID token.

---

## What Changes by Phase as a Result of Auth

### Phase 2 (this phase)
- `POST /auth/register` is implemented but just returns `{ firebase_uid, email }` — no DB write yet
- Client can sign in/out via Google; all protected pages redirect to `/login` if not authenticated
- Axios interceptor attaches tokens to every API request
- Server rejects requests without a valid token

### Phase 3 (Firestore integration)
- `authService.register` gains a Firestore write: `db.collection('users').doc(uid).set({ firebase_uid, email, created_at }, { merge: true })`
- `merge: true` makes register idempotent — calling it again on re-login doesn't overwrite `created_at`
- All other Firestore queries (uploads, decks) will filter by `req.user.uid`

### Phase 4+ (upload pipeline, study modes)
- `POST /uploads/init` uses `req.user.uid` as the `firebase_uid` on the upload document
- `GET /uploads` filters `where('firebase_uid', '==', req.user.uid)`
- `GET /decks` filters `where('firebase_uid', '==', req.user.uid)`
- The Python webhook `POST /webhooks/job-complete` is the one route that does NOT use `authenticate` — it uses `WEBHOOK_SECRET` instead, since it's called by the server's own background jobs, not the browser

---

## Environment Variables Required

### Server (`packages/server/.env`)
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

`FIREBASE_SERVICE_ACCOUNT_JSON` is the full JSON content of the service account key file. Download it from the Firebase console → Project Settings → Service Accounts → Generate new private key. Never commit this file.

### Client (`packages/client/.env.local`)
```
VITE_API_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

These are the **client SDK config values**, not the service account. They are safe to expose publicly — they identify the Firebase project but grant no admin access. Find them in the Firebase console → Project Settings → General → Your apps → Web app.

---

## Gotchas Specific to This Implementation

**Lazy Firebase Admin initialization.**
The Firebase Admin SDK reads env vars when `initializeApp()` is called. If initialization happened at module load time, it would run before `dotenv.config()` — before env vars are loaded. The `getAdminAuth()` function defers initialization to the first call, by which time `dotenv.config()` has already run in `index.ts`.

**`onAuthStateChanged` fires once on mount with `null` before resolving.**
When the app loads, Firebase checks local storage for a persisted session. During this check, `user` is `null` and `isLoading` is `true`. `ProtectedRoute` shows a loading state during this window. Without this check, users with valid sessions would see a flash of the login redirect. `isLoading` must be `false` before any routing decision is made.

**ID tokens expire after 1 hour.**
`user.getIdToken()` in the Axios interceptor handles this transparently — it returns a cached token and refreshes it automatically when needed. Never cache the token string yourself; always call `getIdToken()`.

**`POST /auth/register` should be idempotent.**
Users will call it on every login. In Phase 3, the Firestore write uses `{ merge: true }` so re-registering doesn't reset `created_at` or overwrite future fields.

**The webhook route must NOT use `authenticate`.**
`POST /webhooks/job-complete` is called by Python jobs, not by the browser. It uses a shared `WEBHOOK_SECRET` header instead. Applying `authenticate` to it would break the job pipeline.

**Firebase Admin SDK and Firestore Security Rules don't interact.**
The Admin SDK bypasses all Security Rules. Ownership enforcement is entirely the server's responsibility via `req.user.uid` filtering.
