# Changelog

All notable changes to the Calculator Platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-11-10

Initial release.

### Added

#### Math Engine
- Pure-TypeScript math engine under `src/engine/` — independent of React, Next.js, Prisma, and the browser.
- Tokenizer supporting integers, decimals, scientific notation, identifiers, operators, multi-char operators (`<<`, `>>`), parentheses, commas.
- Recursive-descent parser with precedence climbing, right-associative `^`, implicit multiplication.
- AST evaluator with Decimal.js (50 internal digits, 12 display digits).
- 40+ mathematical functions: arithmetic, powers, roots, factorials, abs, modulo, trigonometry (incl. hyperbolic + inverses), logarithms, exponentials, rounding, sign, GCD, LCM, isPrime, prime factorization, permutations, combinations, statistics (mean, median, mode, variance, stddev, sum, min, max), hypot, rand.
- 5 mathematical constants: π, e, φ, τ, γ.
- Bitwise operations: AND, OR, XOR, NOT, `<<`, `>>` (32-bit signed).
- 109 vitest tests across 8 test suites — all passing.
- Strict error handling with typed `MathError` codes (`DIVISION_BY_ZERO`, `DOMAIN_ERROR`, `OVERFLOW`, `PARSE_ERROR`, `ARITY_MISMATCH`, etc.).

#### Three Calculator Modes
- **Standard**: +, -, *, /, %, +/-, x², √, 1/x, full memory (MC/MR/M+/M-/MS), CE, AC, Backspace, repeated equals, expression editing.
- **Scientific**: powers, roots (incl. n-th root), factorial, abs, trig (sin/cos/tan + inverses + hyperbolic), logarithms (log, ln, logₙ), exp, constants, DEG/RAD toggle, nested parentheses, scientific notation, function composition.
- **Advanced**: Number theory, Statistics, Fractions, Programmer mode (BIN/OCT/DEC/HEX + bitwise), Unit conversion (length/mass/temperature), Date calculation, Random number generation.

#### Calculator UI
- LCD-style display with: main result, expression preview line, M indicator, DEG/RAD indicator, mode indicator, error indicator.
- Raised physical-button component with press animation, hover lift, focus ring, touch feedback, distinct variants (number/operator/function/memory/destructive/utility).
- Mode tabs (Standard/Scientific/Advanced).
- 10 built-in themes via CSS custom properties: Light, Dark, Midnight, OLED Black, Classic Calculator, Modern Glass, Liquid Glass, Transparent, Minimal, High Contrast.
- Theme picker dropdown in the header.
- Theme editor in settings (colors, sizing, fonts).
- Theme import/export (JSON, Zod-validated).

#### Backend
- Next.js 16 App Router with 13 Route Handler endpoints.
- Prisma ORM + SQLite database with 7 models: `CalculationHistory`, `UserPreference`, `Theme`, `UploadedImage`, `MemoryRegister`, `ApplicationSetting`, `RecoverySnapshot`.
- Layered architecture: Repositories → Services → API Routes.
- Server Actions avoided in favor of explicit Route Handlers (per master prompt).
- Prisma Client singleton (`src/lib/db.ts`) configured for hot-reload safety.
- Seed script (`prisma/seed.js`) that creates 10 built-in themes + default memory register.

#### History & Recovery
- Every completed calculation saved to SQLite (debounced).
- History panel: search, mode filter, sort, star, delete one / clear all, pagination (20/page).
- Reuse expression (loads into calculator), copy result to clipboard.
- Export history as JSON, import from JSON.
- Versioned recovery snapshots saved to SQLite + localStorage (debounced 500 ms).
- Reconciliation: prefers newer snapshot between client and server.

#### Image Upload & Editing
- Upload PNG/JPEG/WebP/GIF via multipart form.
- Validation: file size (≤5 MB), dimensions (≤4000×4000), magic byte check (NEVER trusts client MIME), randomized internal filename, storage outside `public/`.
- Image editor UI: crop, rotate, brightness, blur, fit mode, position.
- Live preview before saving.

#### Settings
- 15-category settings dialog with sidebar navigation.
- Categories: General, Calculator Modes, Calculator Behavior, Display, Appearance, Themes, Background Images, Audio, Accessibility, History, Data Recovery, Keyboard Shortcuts, Privacy & Security, Import & Export, About.
- Save / Cancel / Reset section / Reset all to defaults.
- Persisted to SQLite via `/api/settings`.

#### Audio & TTS
- Web Audio API click/operator/error/result sounds (no external audio files).
- Speech synthesis (TTS) for spoken results — configurable voice, rate, volume, language.
- Chinese voice support with graceful fallback.

#### Accessibility (WCAG 2.2 AA)
- Semantic HTML (main, header, nav, section).
- ARIA labels on every interactive element.
- Keyboard navigation with visible focus rings.
- Screen-reader announcements via LiveRegion.
- `prefers-reduced-motion` respected.
- High-contrast theme.
- Scalable text (rem units).
- 44px minimum touch targets.

#### Security
- Strict Content-Security-Policy (`default-src 'self'`, no remote scripts).
- Security headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`.
- Per-IP rate limiting (60 req/min default, in-memory token bucket).
- Zod validation on every API payload.
- Image upload validation: magic-byte check, file-size + dimension caps, randomized filename, storage outside `public/`.
- Theme imports are JSON-only (no JS/CSS/HTML executed).
- Path-traversal protection on file access.
- Typed math errors (no stack traces exposed to users).

#### Offline Support
- Service worker (`public/sw.js`) caches application shell + static assets.
- Math engine runs entirely client-side — calculations work without network.
- History writes queued in `localStorage`, flushed on reconnect.
- Online/offline indicator in header.

#### Documentation
- README.md
- INSTALLATION.md
- USER_GUIDE.md
- ARCHITECTURE.md
- API_DOCUMENTATION.md
- DATABASE_SCHEMA.md
- SECURITY.md
- TESTING.md
- CONTRIBUTING.md
- CHANGELOG.md (this file)
- .env.example

### Known Limitations
- Single-instance rate limiting (in-memory, not distributed).
- Serverless SQLite is not supported (deployment target assumes persistent filesystem).
- Transcendental functions use double-precision floating point (~1e-15 relative error).
- `unsafe-inline` in CSP (required by Next.js hydration + Tailwind).
- No authentication (assumes trusted user).
- No HTTPS enforcement (use a reverse proxy).
- Recovery snapshot migration: version 1 snapshots accepted as-is.

### Tech Stack
- Next.js 16.1 + React 19 + TypeScript 5
- Prisma 6 + SQLite
- Tailwind CSS 4 + shadcn/ui (New York)
- Decimal.js 10.6 (arbitrary precision)
- Zod 4 (validation)
- Vitest 5 (testing)
- Sharp 0.34 (image processing)
- Lucide React (icons, bundled)
- Sonner (toast notifications)

[0.1.0]: https://example.com/releases/0.1.0
