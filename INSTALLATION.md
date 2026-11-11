# Installation

## Prerequisites

- **Node.js 20+** (tested on Node 20 and 22)
- **Bun 1.3+** (recommended — used for package management and dev scripts)
- **SQLite** (bundled with Prisma — no separate install required)

## Step 1: Install dependencies

```bash
bun install
```

This installs:
- Next.js 16, React 19, TypeScript 5
- Prisma 6 + Prisma Client
- Tailwind CSS 4 + shadcn/ui (New York)
- Decimal.js (arbitrary-precision arithmetic)
- Zod (runtime validation)
- Sharp (image processing)
- Vitest (test runner)
- Lucide React (icons — bundled, no CDN)

## Step 2: Configure environment

```bash
cp .env.example .env
```

Edit `.env` to set:

| Variable                | Default                                  | Description                                          |
| ----------------------- | ---------------------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`          | `file:/home/z/my-project/db/custom.db`   | SQLite database path                                 |
| `STORAGE_DIR`           | `./storage`                              | Persistent storage for uploads, exports, backups    |
| `RATE_LIMIT_PER_MIN`    | `60`                                     | Per-IP API rate limit (requests/min)                 |
| `MAX_IMAGE_SIZE_BYTES`  | `5242880`                                | Max upload size (5 MB default)                       |

## Step 3: Initialize the database

```bash
bun run db:push    # Apply the Prisma schema to SQLite (creates tables)
bun run db:seed    # Seed 10 built-in themes + default memory register
```

You should see output confirming 10 themes and 1 memory register were created.

## Step 4: Run tests (recommended)

```bash
bun run test
```

Expected output:
```
Test Files  8 passed (8)
     Tests  109 passed (109)
```

The test suites cover:
- Basic arithmetic, decimals, large numbers
- Operator precedence, parentheses, implicit multiplication
- Scientific functions (powers, roots, factorials, logs, constants)
- Trigonometry (degrees + radians + hyperbolic)
- Edge cases (division by zero, √(-1), log(0), malformed expressions, overflow)
- Number theory (GCD, LCM, isPrime, prime factorization, permutations, combinations)
- Statistics (mean, median, mode, variance, stddev, sum, min, max)
- Programmer mode (base conversion, bitwise ops)

## Step 5: Start the dev server

```bash
bun run dev
```

The server runs on port 3000. Open the preview panel to view the application.

## Step 6: Verify deployment

Open `/api/health` in your browser or curl:

```bash
curl http://localhost:3000/api/health
# {"status":"ok","service":"calculator-platform","time":"...","version":"0.1.0"}
```

## Production build

```bash
bun run build
bun run start
```

The build produces a standalone Next.js bundle in `.next/standalone/`. Note that the deployment target is a **self-hosted Node.js environment with persistent local storage** — SQLite and uploaded image directories must persist across restarts. Serverless hosting (Vercel, AWS Lambda, etc.) does NOT support persistent local SQLite.

## Troubleshooting

### Port already in use
```bash
Error: listen EADDRINUSE: address already in use :::3000
```
Either stop the other process or change the port in `package.json` (`dev` script).

### Database locked / migration errors
```bash
rm -f db/custom.db
bun run db:push
bun run db:seed
```

### Prisma Client out of sync with schema
```bash
bun run db:generate
```

### Service worker not registering
Open browser DevTools → Application → Service Workers. Unregister, then refresh the page. The service worker is best-effort and does not block calculator functionality.

### Theme switching has no visible effect
- Confirm themes loaded: `curl http://localhost:3000/api/themes` should return 10 themes.
- Check that `<html>` has a `data-theme` attribute after picking a theme.
- Hard-refresh the browser (Ctrl+Shift+R).

### Math evaluation returns "Error"
The math engine raises typed errors for invalid inputs. Check the error ribbon at the top of the calculator for a human-readable message. Common causes:
- `1/0` → Division by zero
- `sqrt(-1)` → Square root of a negative number
- `log(0)` → Logarithm of zero
- `(-1)!` → Factorial of a negative number
- `((2+3)` → Unbalanced parentheses

### Lint errors
```bash
bun run lint
```
The project enforces ESLint with `eslint-config-next` plus React Hooks rules. All `setState`-in-effect calls are flagged — use the `// eslint-disable-next-line react-hooks/set-state-in-effect` comment for legitimate cases (e.g. loading from localStorage on mount).

## Node version compatibility

Tested on:
- Node 20.10.0
- Node 22.0.0
- Bun 1.3.14

If you encounter ESM issues with older Node versions, prefer Bun.
