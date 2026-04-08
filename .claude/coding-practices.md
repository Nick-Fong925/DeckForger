# DeckForge Coding Practices

This document defines the rules for the DeckForge codebase — a full-stack flashcard app built with React + TypeScript (client), Express + TypeScript (server), Zod schemas (shared), and Python background jobs. These rules are opinionated and specific. When in doubt, follow them exactly.

---

## Monorepo Structure

```
packages/
  shared/     # Zod schemas, inferred types, shared utilities
  client/     # React + Vite frontend
  server/     # Express backend
jobs/         # Python background workers (separate toolchain)
```

---

## 1. File Size Limits

- **Hard limit: 200 lines per file.** If a file exceeds 200 lines, it must be split before the PR merges.
- **Soft limit: 150 lines.** Files approaching 150 lines should be reviewed for split candidates during authorship, not just at review time.
- **Functions: max 40 lines.** A function that exceeds 40 lines is doing too much. Extract helpers or split into a service method.
- **React components: max 150 lines** including JSX. If a component's render return alone is approaching 80 lines, extract sub-components.
- **Route files: max 80 lines.** A route file should only register routes and delegate to handlers/services — not contain business logic.

**How to decide where to split:**
- If you can name the extracted piece cleanly (e.g., `useCardValidation`, `formatDeckSummary`, `CardListItem`), extract it.
- If naming it requires "And" or "Or" (e.g., `validateAndSaveCard`), it's two things — split further.
- Prefer many small files over one large file. File navigation is cheap; cognitive load is not.

---

## 2. Folder and Module Organization

### `packages/shared/src/`
```
schemas/        # All Zod schema definitions, one file per domain
  deck.ts
  card.ts
  user.ts
types/          # Re-exported inferred types only (no standalone type definitions here)
  index.ts
utils/          # Pure functions usable on both client and server
  index.ts
```

### `packages/server/src/`
```
routes/         # Express routers, one file per resource (decks.ts, cards.ts)
middleware/     # Reusable middleware (auth.ts, validate.ts, errorHandler.ts)
services/       # Business logic, one file per domain (deckService.ts, cardService.ts)
repositories/   # Database access layer, one file per entity
controllers/    # Thin handler functions that call services (optional layer if needed)
config/         # Environment config, db setup
types/          # Server-only types (e.g., AuthenticatedRequest)
```

### `packages/client/src/`
```
components/     # Reusable UI components, one component per file
  ui/           # Generic primitives (Button, Input, Modal)
  deck/         # Domain-specific components (DeckCard, DeckList)
  card/
pages/          # Route-level page components (one per route)
hooks/          # Custom hooks, one hook per file
services/       # API call functions (not React Query — just the fetch wrappers)
  api/
    decks.ts
    cards.ts
lib/            # Third-party client setup (queryClient.ts, axios.ts)
types/          # Client-only types
stores/         # Zustand stores or context providers (if used)
```

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files (components) | PascalCase | `DeckCard.tsx` |
| Files (everything else) | camelCase | `deckService.ts`, `useDecks.ts` |
| React components | PascalCase | `DeckCard`, `StudySession` |
| Custom hooks | camelCase prefixed with `use` | `useDecks`, `useStudySession` |
| Types and interfaces | PascalCase | `DeckSummary`, `CreateCardInput` |
| Zod schemas | camelCase suffixed with `Schema` | `deckSchema`, `createCardSchema` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_CARDS_PER_DECK`, `DEFAULT_PAGE_SIZE` |
| Variables and functions | camelCase | `fetchDeck`, `deckCount` |
| Boolean variables | prefixed with `is`, `has`, `can`, `should` | `isLoading`, `hasError`, `canEdit` |
| API route files | lowercase, plural | `decks.ts`, `cards.ts` |

---

## 3. TypeScript Practices

- **`strict: true` is non-negotiable.** The `tsconfig.json` in every package must have `"strict": true`. Never disable or override it.
- **No `any`.** Use `unknown` when the type is genuinely unknown, then narrow it. If you are tempted to use `any`, use a Zod schema to parse and infer instead.
- **No `// @ts-ignore` or `// @ts-expect-error`** except in test files or generated code, and always with a comment explaining why.
- **Prefer `type` over `interface`** for object shapes unless you explicitly need declaration merging. Use `interface` only for things that will be extended or implemented.
- **Infer types from Zod schemas; do not duplicate them.** If a Zod schema exists for a shape, its TypeScript type must be derived from it via `z.infer<>`, not written by hand.
- **Never write a type that duplicates a Zod schema.** The schema is the source of truth.
- **Generics: use them when the same logic applies to multiple types.** Do not make something generic just because you can. If a function only ever operates on `Deck`, type it as `Deck`.
- **Avoid type assertions (`as`).** If you find yourself casting, you likely need to parse with Zod or restructure the data flow. The only acceptable use of `as` is when narrowing after a guard that TypeScript cannot track, and it must have a comment.
- **Use `satisfies`** to validate object literals against a type without widening, especially for config objects.
- **Return types on exported functions are required.** Annotate the return type on all exported functions and hooks explicitly — do not rely solely on inference for public API surfaces.

---

## 4. React Practices

- **One component per file.** No exceptions. Do not export multiple components from a single file. Helper sub-components that are never used elsewhere can be co-located in the same file only if they are unexported and under 30 lines.
- **Component file = component name.** `DeckCard.tsx` exports `DeckCard` as its default or named export. The names must match.
- **Max 3 levels of prop drilling.** If a prop passes through more than 3 components without being used, introduce React Query, Context, or a store.
- **Use React Query for all server state.** Do not use `useEffect` + `useState` to fetch data. All async server data goes through `useQuery` or `useMutation`.
- **Use React Context only for stable, low-frequency state** (e.g., current user session, theme, feature flags). Never put frequently-changing data in context.
- **Extract a custom hook when:**
  - A component has more than 2 `useState` calls related to the same concern.
  - A `useEffect` has more than 10 lines of logic.
  - The same stateful logic appears in more than one component.
- **Hooks live in `hooks/`.** Never define a hook inline in a page component. The page's job is composition, not logic.
- **Props interfaces are named `[ComponentName]Props`** and defined in the same file as the component, directly above it.
- **No anonymous default exports.** Always name your components. `export default function DeckCard(...)` not `export default (props) => ...`.
- **Avoid `useEffect` for derived state.** If a value can be computed from existing state or props, compute it inline or with `useMemo`. `useEffect` is for synchronization with external systems.
- **Event handler naming: prefix with `handle`.** `handleSubmit`, `handleCardClick`, `handleDeleteConfirm`.

---

## 5. Express Practices

- **Route handlers must be thin.** A route handler's only job is to: (1) extract validated input, (2) call a service, (3) send the response. No business logic in handlers.
- **Validate all input at the route boundary using Zod.** Use a `validate` middleware that parses `req.body`, `req.params`, and `req.query` against the appropriate schema from `packages/shared`. Reject before calling the service.
- **Services own business logic.** Database queries, calculations, side effects, and multi-step operations all live in service functions. Service functions are plain async functions — no `req`/`res` references.
- **Repositories own database access.** If a service needs to query the DB, it calls a repository function. Services must not write raw SQL or ORM queries inline.
- **Error handling via a central error middleware.** Throw typed errors (e.g., `NotFoundError`, `ValidationError`) from services. A single `errorHandler` middleware at the bottom of `app.ts` converts them to HTTP responses.
- **Never send raw error objects to the client.** The error handler must sanitize and shape all error responses. In production, do not expose stack traces.
- **Middleware composition in `app.ts` only.** Middleware is registered in one place, in a deliberate order. Do not register middleware inside route files.
- **Async route handlers must be wrapped.** Use a `asyncHandler` wrapper or an equivalent to ensure unhandled promise rejections route to the error middleware.

```typescript
// Pattern for a thin route handler
router.post('/', validate(createDeckSchema), asyncHandler(async (req, res) => {
  const deck = await deckService.create(req.body);
  res.status(201).json(deck);
}));
```

---

## 6. Shared Package Patterns

- **`packages/shared` is the single source of truth for all data shapes** that cross the client/server boundary. If a type is used on both sides, it belongs in shared.
- **Schemas define the shape; types are derived from schemas.** In `packages/shared/src/schemas/deck.ts`:

```typescript
import { z } from 'zod';

export const deckSchema = z.object({ ... });
export const createDeckSchema = deckSchema.omit({ id: true, createdAt: true });
export const updateDeckSchema = createDeckSchema.partial();

// Types are co-located with their schemas
export type Deck = z.infer<typeof deckSchema>;
export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
```

- **Never define the same shape in both client and server.** If you find yourself writing a type in `packages/server/src/types/` that looks like a schema in shared, stop and use the shared type.
- **Server parses with Zod; client trusts parsed server responses.** The server validates all incoming data. The client can use the inferred types without re-parsing (trust the contract). Exception: forms — always validate user input on the client too.
- **Do not put server-only or client-only things in shared.** No `express` imports, no `react` imports, no DOM types in `packages/shared`.
- **`packages/shared` exports through a clean `index.ts`.** Consumers import from `@deckforge/shared`, never from deep paths like `@deckforge/shared/src/schemas/deck`.

---

## 7. Imports

- **Use absolute imports everywhere.** Configure path aliases in `tsconfig.json` and Vite. Never use `../../../` with more than 2 levels. If you need 3+ levels, something is in the wrong folder.

```json
// tsconfig.json paths example (client)
"paths": {
  "@/*": ["./src/*"]
}
```

- **Import order (enforced by ESLint):**
  1. Node built-ins
  2. External packages
  3. Internal packages (`@deckforge/shared`)
  4. Absolute internal imports (`@/components`, `@/hooks`)
  5. Relative imports (`./`, `../`)
  6. Type-only imports last within each group

- **Barrel files (`index.ts`) — use selectively:**
  - YES: one barrel per package's public API (`packages/shared/src/index.ts`)
  - YES: one barrel per major feature folder if it has 5+ exports (`components/deck/index.ts`)
  - NO: do not create barrels just for convenience — they hide the module graph and hurt tree-shaking
  - NO: never barrel-export everything in a folder by default; be explicit about what is public

- **No circular dependencies.** The allowed dependency direction is: `client` → `shared`, `server` → `shared`. Client and server must never import from each other. Within a package: `routes` → `services` → `repositories`. Enforce with ESLint `import/no-cycle`.

- **Type-only imports use `import type`.** Always use `import type { Foo }` when importing only types. This is not optional.

---

## 8. Code Quality Rules

- **No magic numbers or strings.** Any literal value with non-obvious meaning must be a named constant.

```typescript
// Bad
if (cards.length > 500) { ... }

// Good
const MAX_CARDS_PER_DECK = 500;
if (cards.length > MAX_CARDS_PER_DECK) { ... }
```

- **Early returns over nested conditionals.** Guard clauses at the top of a function; the happy path at the bottom. Never nest `if` inside `if` inside `if`.

```typescript
// Bad
function processCard(card: Card | null) {
  if (card) {
    if (card.isActive) {
      // ... happy path buried here
    }
  }
}

// Good
function processCard(card: Card | null) {
  if (!card) return;
  if (!card.isActive) return;
  // ... happy path here
}
```

- **No nested ternaries.** One ternary per expression, maximum. If you need a second ternary, use `if/else` or extract a helper.

```typescript
// Bad
const label = isLoading ? 'Loading...' : hasError ? 'Error' : 'Done';

// Good
function getStatusLabel(isLoading: boolean, hasError: boolean): string {
  if (isLoading) return 'Loading...';
  if (hasError) return 'Error';
  return 'Done';
}
```

- **No commented-out code.** Delete it. Git history exists for a reason.
- **No `console.log` in committed code.** Use a logger in the server (`pino` or equivalent). In the client, remove debug logs before committing. ESLint `no-console` is enabled.
- **Prefer `const` over `let`.** Only use `let` when reassignment is genuinely required. Never use `var`.
- **Explicit `undefined` checks over truthiness for objects.** Use `=== undefined` or `=== null` rather than relying on falsy coercion when the value could be `0`, `''`, or `false`.
- **No default exports from utility/service files.** Only components use default exports. Services, hooks, schemas, and utilities use named exports exclusively.
- **Descriptive names over short names.** Variables live longer than you think. `deckId` not `id`, `filteredCards` not `cards2`, `isSubmitting` not `submitting`.

---

## 9. Python Jobs (Background Workers)

- Background jobs in `jobs/` follow the same file size and single-responsibility rules.
- Each job is a single-purpose script with a clearly named entry point.
- Jobs must not import from or depend on the TypeScript packages. They communicate via the database or a message queue only.
- Type annotations are required (Python 3.10+ style). No untyped functions.
- Pydantic models are used for any data structure that crosses a system boundary (same philosophy as Zod in the TS packages).

---

## 10. Enforcement

These rules are enforced via:
- **ESLint** — `no-any`, `no-console`, `import/no-cycle`, `import/order`, `no-nested-ternary`
- **TypeScript compiler** — `strict: true`, no overrides
- **PR review** — reviewers are expected to flag rule violations; authors are expected to have checked this document first

When a rule must be broken for a legitimate reason, the exception must be:
1. Documented in a comment at the point of exception.
2. Discussed in the PR description.
3. Not a precedent for future exceptions.

---

## 11. Responsive Design

DeckForge must feel native across mobile (375px+), tablet/iPad (768px+), and desktop (1024px+). Use a **mobile-first** approach — write base styles for mobile, then layer `sm:`, `md:`, and `lg:` overrides for larger screens.

### Breakpoints (Tailwind defaults)

| Prefix | Min-width | Target |
|---|---|---|
| _(none)_ | 0px | Mobile (375px base design target) |
| `sm:` | 640px | Large phone / small tablet |
| `md:` | 768px | iPad portrait |
| `lg:` | 1024px | iPad landscape / small desktop |
| `xl:` | 1280px | Wide desktop |

### Touch Targets

- All interactive elements (buttons, links, inputs) must be **at least 44×44px** — the iOS and Android minimum.
- The `.btn` class sets `min-height: 2.75rem` (44px) globally. Never shrink this.
- Use `py-2.5` or `py-3` as the minimum vertical padding on touch-facing buttons. **Never `py-1`** in a nav or action context.
- Leave at least 8px of space between adjacent tap targets.

### Layout & Spacing

- Always use responsive horizontal padding on containers: **`px-4 sm:px-6`** — never a bare `px-6`.
- **Page-level `max-w-*` constraints** (e.g., `max-w-xl`) look fine on desktop but leave wasted whitespace on iPad portrait. Expand them at larger breakpoints: `max-w-xl md:max-w-2xl`, or remove and let the parent container govern width.
- Stack vertically on mobile, go side-by-side on tablet+: `flex-col sm:flex-row` or `grid-cols-1 sm:grid-cols-2`.
- **Header rows** (title + action button) must wrap gracefully: use `flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`. Never assume they won't wrap.

### Typography

- Page `<h1>` headings: **`text-2xl sm:text-3xl`** — `text-3xl` alone is oversized on small phones.
- Never scale body text below `text-sm` — readability on small screens matters more than density.

### Navigation

- All nav links must meet the 44px touch target height — `py-2.5` minimum.
- On screens narrower than `sm:` (640px), long nav labels can overflow. Abbreviate, hide secondary links, or use a menu.
- Never let the nav overflow horizontally without a scroll or collapse strategy.

### Grids

- Default to `grid-cols-1`, expand with `sm:grid-cols-2`, then `lg:grid-cols-3`.
- `grid-cols-2` is acceptable for small content tiles (e.g., format badges) but test at 375px — if text wraps badly, drop to `grid-cols-1 sm:grid-cols-2`.
- Never use a fixed multi-column grid without a single-column mobile fallback.

### Testing Widths

Test every page at: **375px** (iPhone SE), **768px** (iPad portrait), **1024px** (iPad landscape / small desktop). Use browser DevTools device emulation during development.
