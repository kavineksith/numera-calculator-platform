# Architecture

## Overview

The Calculator Platform is a Next.js 16 application with a strict separation between the **pure-TS math engine** and the **React/Next.js/Prisma application layer**.

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (Client)                                             │
│                                                              │
│  React UI (Single Page)                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Standard     │  │ Scientific   │  │ Advanced     │       │
│  │ Calculator   │  │ Calculator   │  │ Calculator   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         └─────────────────┴─────────────────┘                │
│                    │                                         │
│         CalculatorContext (reducer)                          │
│                    │                                         │
│         ┌──────────┴───────────┐                             │
│         │ Math Engine (pure TS) │ ◄── NO React/Next/Prisma   │
│         │ tokenizer → parser → │      NO browser APIs        │
│         │ AST → evaluator       │                             │
│         │ + Decimal.js          │                             │
│         └──────────────────────┘                             │
│                    │                                         │
│         fetch('/api/...') (relative only)                    │
└────────────────────┼─────────────────────────────────────────┘
                     │ HTTPS
┌────────────────────┴────────────────────────────────────────┐
│ Next.js Server (Node.js runtime)                            │
│                                                              │
│  Proxy (security headers, CSP, rate-limit)                  │
│         │                                                    │
│  Route Handlers (/app/api/...)                              │
│  ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ history   │ │ themes │ │settings│ │ images │ │recovery│  │
│  └────┬─────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘  │
│       └───────────┴──────────┴───────────┴───────────┘       │
│                    │                                         │
│         Services (server-only, "use server")                │
│         ┌──────────────────────────────────┐                │
│         │ historyService, themeService,     │                │
│         │ settingsService, imageService,    │                │
│         │ recoveryService, exportService    │                │
│         └─────────────┬────────────────────┘                │
│                       │                                      │
│         Repositories (Prisma queries)                      │
│         ┌─────────────┴────────────────────┐                │
│         │ history-repo, theme-repo, etc.    │                │
│         └─────────────┬────────────────────┘                │
│                       │                                      │
│         Prisma Client (singleton, server-only)              │
└──────────────────────┼──────────────────────────────────────┘
                       │
                ┌──────┴──────┐
                │ SQLite file  │
                │ (custom.db)  │
                └─────────────┘
```

## Layers

### 1. Presentation Layer (`src/components/`)
React components for the calculator UI, history panel, theme picker, settings dialog, image editor, accessibility live regions. Client Components (`"use client"`) for interactive elements.

### 2. Calculator Interaction Layer (`src/context/CalculatorContext.tsx`, `src/hooks/`)
The `CalculatorProvider` wraps the application in a `useReducer`-backed state machine. Side effects (history persistence, recovery snapshots) are managed via `useEffect` with debouncing.

### 3. Mathematical Engine (`src/engine/`)
**Completely independent of React, Next.js, Prisma, and browser APIs.** Pure TypeScript modules:
- `tokenizer/` — converts an expression string to a token stream
- `parser/` — recursive-descent parser with precedence climbing; produces an AST
- `ast.ts` — AST node types
- `evaluator/` — walks the AST and produces a `Decimal` result
- `precision/` — Decimal.js configuration (50 internal digits, 12 display)
- `advanced/` — domain-specific helpers (number theory, statistics, programmer, fractions, units)
- `__tests__/` — 109 vitest tests

This separation is mandatory:
- The engine can be imported by both Client Components and Server Components.
- The engine can be unit-tested in isolation without spinning up React or Prisma.
- The engine has zero runtime dependencies on Next.js.

### 4. Business Logic & Services (`src/services/`)
Server-only modules (marked with `import "server-only"`) that implement the business rules. Each service exposes a typed contract:

- `historyService.list/get/evaluateAndStore/toggleStar/delete/clearAll`
- `themeService.seedBuiltIns/list/get/create/update/delete/importTheme/exportAll`
- `settingsService.get/save/reset`
- `imageService.uploadImage/getImageFile/removeImage/listAllImages`
- `recoveryService.getLatest/save/clear`
- `exportService.exportAllData`

### 5. Data Access Layer (`src/repositories/`)
Wraps Prisma queries. Keeps raw Prisma calls out of services and components. Each repository function returns plain Prisma rows.

### 6. Prisma Database Layer (`prisma/schema.prisma`, `src/lib/db.ts`)
- `src/lib/db.ts` is a **singleton Prisma Client** configured for Next.js hot-reload safety.
- Marked as server-only via `import "server-only"` is implicit through Prisma's nature.
- The schema defines 7 models with appropriate indexes, constraints, and JSON fields for structured data.

### 7. API Layer (`src/app/api/`)
Next.js Route Handlers under `/app/api/`. Each endpoint:
- Validates the request body with Zod.
- Calls the appropriate service method.
- Returns a `jsonBody(payload, init)` response with security headers attached.

Endpoints:
- `/api/health` — GET (DB ping)
- `/api/history` — GET (paginated list), POST (evaluate-and-store), PUT (bulk import)
- `/api/history/[id]` — GET, PATCH (toggle star), DELETE
- `/api/history/export` — GET (download JSON)
- `/api/settings` — GET, PUT, DELETE
- `/api/themes` — GET, POST
- `/api/themes/[id]` — GET, PUT, DELETE
- `/api/themes/import` — POST
- `/api/themes/export` — GET
- `/api/images` — GET, POST (multipart)
- `/api/images/[id]` — GET (serve file), DELETE
- `/api/recovery` — GET, POST, DELETE
- `/api/export` — GET (full export: history + themes)
- `/api/evaluate` — POST (stateless evaluation, no persistence)

### 8. Validation Layer (`src/lib/validation/`)
Zod schemas for every API payload:
- `expression.ts` — `expressionSchema`, `evaluateRequestSchema`, `createHistoryEntrySchema`, `historyQuerySchema`
- `theme.ts` — `themeConfigSchema` (with colors/sizing/fonts sub-schemas)
- `image.ts` — `imageMetadataSchema`, `imageTransformSchema`, magic-byte detection, filename sanitization
- `settings.ts` — `settingsSchema` (composite of 6 sections: general, behavior, display, audio, accessibility, privacy)

### 9. Security Middleware (`src/proxy.ts`)
Next.js 16's "proxy" convention (formerly `middleware.ts`). Runs on every request:
- Skips static assets.
- Applies security headers + CSP to all responses.
- Applies per-IP rate limiting (token bucket, 60 req/min default) to `/api/*` requests.
- Returns 429 with `Retry-After` header when limit exceeded.

### 10. Storage & Recovery Layer
- SQLite (`db/custom.db`) for persistent records.
- `localStorage` for immediate client-side recovery (debounced 500 ms).
- `storage/uploads/` (outside `public/`) for uploaded images — never served directly.
- Versioned `RecoverySnapshot` records support schema migration (current version: 1).

## Math Engine Architecture

### Tokenizer
Converts a string to a `Token[]` array. Handles:
- Integers, decimals, scientific notation (`1.5E3`, `2.5e-2`)
- Identifiers (function names + constants)
- Operators: `+`, `-`, `*`, `/`, `^`, `%`, `!` (single-char)
- Multi-char operators: `<<`, `>>`
- Parens, commas
- Whitespace skipping

### Parser
Recursive-descent with precedence climbing. Grammar:
```
expression  := additive
additive    := multiplicative ((+ | - | mod | and | or | xor | << | >>) multiplicative)*
multiplicative := unary ((* | / | %) unary)*
unary       := (- | + | not) unary | power
power       := postfix (^ unary)?         // right-associative
postfix     := primary (!)*
primary     := NUMBER | CONSTANT | VARIABLE | funcCall | ( expression )
```

Implicit multiplication is supported at the binary level — a NUMBER, LPAREN, or IDENTIFIER (constant/function) immediately following another primary is treated as multiplication.

### AST
Discriminated union of node types: `Number`, `Constant`, `Variable`, `UnaryOp`, `BinaryOp`, `PostfixOp` (factorial), `FunctionCall`.

### Evaluator
Walks the AST. Each binary/unary operator is implemented with Decimal.js for arbitrary-precision arithmetic. Transcendental functions (sin, cos, log, sqrt for non-integer inputs, etc.) use native `Math.*` — these are accurate to roughly 1e-15 relative error, which is documented in `SECURITY.md` and tested with tolerance-based assertions.

### Edge Cases
The engine raises typed `MathError` (with codes like `DIVISION_BY_ZERO`, `DOMAIN_ERROR`, `OVERFLOW`, `PARSE_ERROR`, `ARITY_MISMATCH`) for:
- `1/0` → DIVISION_BY_ZERO
- `sqrt(-1)` → DOMAIN_ERROR
- `log(0)`, `log(-1)` → DOMAIN_ERROR
- `(-1)!` → DOMAIN_ERROR
- `exp(1000)` → OVERFLOW
- `50000!` → OVERFLOW (cap to prevent hangs)
- `2**3` → PARSE_ERROR (we use `^` for power; `**` is malformed)
- `((2+3)` → PARSE_ERROR (unbalanced parens)
- `foo(3)` → UNKNOWN_FUNCTION
- `sin()` → ARITY_MISMATCH

## DSA Implementations

| Structure | Where used | Why |
| --------- | ---------- | --- |
| **Stack** (implicit via recursion) | Parser's recursive descent | Tracks operator precedence and paren depth |
| **Hash Map** | `FUNCTIONS` and `CONSTANTS` lookup tables in the engine; in-memory rate-limit buckets | O(1) operator/function lookup |
| **Tree** | AST representation | Naturally models nested expressions |
| **Sorting** | Statistics (median, percentile), history list ordering | Required for median computation |
| **Caching** | `Decimal.PI` constant precomputed once; theme lookups cached client-side | Avoid recomputing immutable values |
| **Token bucket** (rate limiter) | Per-IP request budget | Smooths traffic spikes without hard limits |

## Decimal.js Configuration

```typescript
Decimal.set({
  precision: 50,             // internal significant digits
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -1e9,            // never use exponential notation internally
  toExpPos: 1e9,
  minE: -1e9,
  maxE: 1e9,
  errors: true,
});
```

Display precision is 12 significant digits, formatted via `formatResult()` which strips trailing zeros and switches to scientific notation for magnitudes outside `[-9, 15]` exponent range.

## Offline Architecture

- **Service worker** (`public/sw.js`) precaches the HTML shell and uses cache-first for static assets, network-first for navigations.
- **Math engine** runs entirely client-side — no API calls for calculations.
- **History writes** are queued in `localStorage` when offline and flushed via the `online` event listener.
- **Theme data** is cached client-side and falls back gracefully when the API is unreachable.
- **Settings** are cached in `localStorage` and synced on reconnect.

## Known Limitations

- **Single-instance rate limiting:** the in-memory token bucket does not protect multi-instance deployments. For distributed deployments, use Redis or similar.
- **Serverless SQLite:** the deployment target assumes a persistent filesystem. Serverless platforms (Vercel, AWS Lambda) do NOT preserve SQLite across invocations.
- **Transcendental accuracy:** `sin`, `cos`, `log`, etc. use JavaScript's `Math.*` which is double-precision floating point. The engine is accurate to roughly 1e-15 relative error — sufficient for calculator use but not for cryptographic or scientific-grade computation.
- **Recovery migration:** version 1 snapshots are accepted as-is. Future schema changes will need explicit migration logic (documented in `recovery-service.ts`).
