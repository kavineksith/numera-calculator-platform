# Numera Calculator Platform

A professional, production-grade multi-mode calculator built with **Next.js 16**, **TypeScript**, **Prisma ORM** (SQLite), and a **pure-TypeScript math engine** using **Decimal.js** for arbitrary-precision arithmetic.

![Tech Stack](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-6-blue) ![Vitest](https://img.shields.io/badge/Tests-109%20passing-brightgreen)

## Features

### Three Calculator Modes

| Mode         | Capabilities                                                                                |
| ------------ | ------------------------------------------------------------------------------------------- |
| **Standard** | +, -, *, /, %, +/-, x², √, 1/x, full memory (MC/MR/M+/M-/MS), CE, AC, Backspace, repeat =  |
| **Scientific** | Powers, roots (incl. n-th root), factorial, abs, trig (sin/cos/tan + inverses + hyperbolic), logarithms (log, ln, logₙ), exp, constants (π, e, φ, τ, γ), DEG/RAD toggle, nested parentheses, scientific notation |
| **Advanced** | Number theory (GCD, LCM, isPrime, prime factorization, P(n,k), C(n,k)) · Statistics (mean, median, mode, variance, stddev, sum, min, max) · Fractions (decimal → fraction, mixed numbers) · Programmer mode (BIN/OCT/DEC/HEX, bitwise AND/OR/XOR/NOT/<<,>>) · Unit conversion · Date diff · Random |

### Mathematical Engine

- **Independent of React, Next.js, Prisma, and the browser** — pure TypeScript modules under `src/engine/`.
- **Tokenizer → Parser → AST → Evaluator** pipeline (no `eval()` or `new Function()`).
- Recursive-descent parser with **precedence climbing**, right-associative `^`, implicit multiplication (`2π`, `2(3+1)`).
- **Decimal.js** for arbitrary-precision arithmetic (50 internal significant digits, 12 display digits).
- Transcendental functions use native floating-point with documented tolerances.
- Strict handling of edge cases: division by zero, √(-1), log(0), log(-1), (-1)!, overflow, malformed expressions.
- **109 tests passing** across 8 test suites (arithmetic, precedence, scientific, trigonometry, edge-cases, number-theory, statistics, programmer).

### Backend & Database

- **Next.js App Router** with Route Handlers under `/api/*`.
- **Prisma ORM** + **SQLite** for persistent storage.
- 7 database models: `CalculationHistory`, `UserPreference`, `Theme`, `UploadedImage`, `MemoryRegister`, `ApplicationSetting`, `RecoverySnapshot`.
- Layered architecture: Repositories → Services → API Routes. Prisma Client is server-only.
- Migrations + seed scripts (`bun run db:push`, `bun run db:seed`).

### Security

- Strict **Content-Security-Policy** (`default-src 'self'`, no remote scripts).
- Security headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.
- **Rate limiting** (60 req/min default, in-memory token bucket per IP).
- **Zod** validation on every API payload (expressions, themes, settings, image uploads).
- Image upload validation: magic-byte verification (NEVER trusts client MIME), file-size + dimension caps, randomized internal filenames, storage outside `public/`.
- Theme imports are **JSON-validated** — never executed (no JS/CSS/HTML from user input).
- Path-traversal protection on file access.

### Themes & Customization

- 10 built-in themes: Light, Dark, Midnight, OLED Black, Classic Calculator, Modern Glass, Liquid Glass, Transparent, Minimal, High Contrast.
- Theme engine based on CSS custom properties (`data-theme` attribute on `<html>`).
- Theme editor with color pickers, sizing sliders, font selectors.
- Import/export themes as JSON (Zod-validated).
- Theme schema is documented and versioned.

### History & Recovery

- Every calculation saved to SQLite (debounced via the context reducer).
- History panel with search, mode filter, sort asc/desc, star, delete one / clear all, pagination (20/page).
- Reuse expression (loads into calculator), copy result to clipboard.
- Export history as JSON, import from JSON.
- **Versioned recovery snapshots** saved to SQLite + localStorage.
- Reconciliation: if localStorage has a newer timestamp than SQLite, the local copy wins.

### Audio & TTS

- Synthesized click/operator/error/result sounds via the **Web Audio API** (no external audio files).
- **Speech synthesis** (TTS) for spoken results — configurable voice, rate, volume, language.
- Detects installed voices dynamically. Chinese voice support with graceful fallback.

### Accessibility (WCAG 2.2 AA)

- Semantic HTML (`main`, `header`, `nav`, `section`).
- `aria-label` on every interactive element.
- Visible focus rings, keyboard navigation, 44px touch targets.
- `prefers-reduced-motion` respected.
- High-contrast theme and scalable text.
- Live region for screen-reader result announcements.

### Offline Support

- **Service worker** caches the application shell + static assets.
- Math engine runs entirely client-side — calculations work without a network.
- History writes are queued in `localStorage` and flushed on reconnect.
- Online/offline indicator in the header.

## Quick Start

```bash
# Install dependencies
bun install

# Configure environment
cp .env.example .env

# Initialize the database
bun run db:push
bun run db:seed

# Run the math engine tests
bun run test

# Start the dev server (Next.js will auto-start on port 3000)
bun run dev
```

Open the preview panel to view the application.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript 5 (strict)
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York)
- **Database:** Prisma ORM + SQLite
- **Math:** Decimal.js (arbitrary precision)
- **Validation:** Zod
- **Tests:** Vitest (109 passing)
- **Icons:** Lucide React (bundled)
- **Image processing:** Sharp

## Documentation

- [INSTALLATION.md](./INSTALLATION.md) — Full setup, env vars, troubleshooting
- [USER_GUIDE.md](./USER_GUIDE.md) — How to use every feature
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Layer diagram, math engine, data flow
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) — Every endpoint documented
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) — Prisma models, indexes, relationships
- [SECURITY.md](./SECURITY.md) — OWASP controls, CSP, rate limiting, file upload safety
- [TESTING.md](./TESTING.md) — How to run tests, what's covered
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Code style, branching, PR process
- [CHANGELOG.md](./CHANGELOG.md) — Release history

## Project Structure

```
src/
  app/
    api/                    # REST API route handlers
      health/ history/ themes/ images/ recovery/ export/ settings/
    layout.tsx  page.tsx    # Single-page calculator UI
  components/
    calculator/             # Calculator, StandardCalculator, ScientificCalculator, AdvancedCalculator
    display/                # LcdDisplay, ErrorRibbon
    history/                # HistoryPanel, HistoryItem
    themes/                 # ThemePicker, ThemeEditor, ThemeImporter
    settings/               # SettingsDialog + 13 category components
    image-editor/           # ImageUploader, ImageEditor
    accessibility/          # LiveRegion
  context/                  # CalculatorContext (reducer-backed state)
  engine/                   # PURE TS math engine (no React/Next/Prisma)
    tokenizer/ parser/ evaluator/ precision/ advanced/
    __tests__/              # 109 vitest tests
  hooks/                    # useCalculator, useKeyboard, useAudio, useThemes, useSettings, useRecovery, useLocalStorage
  lib/
    db.ts                   # Prisma Client singleton (server-only)
    validation/             # Zod schemas (theme, expression, image, settings)
    security/               # rate-limit, headers, csrf
    storage/                # paths (outside public/)
  services/                 # history, theme, settings, image, recovery, export
  repositories/             # Prisma queries (server-only)
  proxy.ts                  # Next.js 16 proxy (formerly middleware) — CSP, headers, rate limit
  styles/themes.css         # CSS variables for 10 themes
prisma/
  schema.prisma             # 7 models
  seed.js                  # Built-in themes + default memory
storage/                   # uploads/ backgrounds/ exports/ backups/ (NEVER in public/)
public/sw.js               # Service worker
vitest.config.ts
```

## License

MIT License — see [`LICENSE`](./LICENSE).
