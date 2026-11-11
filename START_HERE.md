# Calculator Platform — Quick Start

This zip contains the complete source code of the Professional Multi-Mode Calculator Platform.

## Setup (3 commands)

```bash
bun install                     # Install dependencies
cp .env.example .env            # Configure environment
bun run db:push && bun run db:seed  # Initialize database + seed themes
```

## Run

```bash
bun run dev                     # Start dev server on port 3000
```

Open http://localhost:3000 in your browser.

## Verify

```bash
bun run test                    # 109 math engine tests (all should pass)
bun run lint                    # 0 errors expected
node tests/security/run.js      # 49 security tests (all should pass)
curl http://localhost:3000/api/health    # Should return {"status":"ok",...}
```

## What's Included

- 3 calculator modes: Standard, Scientific, Advanced
- Pure-TS math engine with Decimal.js precision (109 tests passing)
- 10 built-in themes
- History panel with search, filter, sort, star, export
- Recovery (versioned SQLite snapshots + localStorage)
- Image upload with magic-byte validation
- Settings (15 categories)
- Audio + TTS (Web Audio API + speechSynthesis)
- Offline support via service worker
- Security: strict CSP, rate limiting, Zod validation, CSRF protection, no eval(), HTML-escaped JSON output
- 49 security tests passing (0 vulnerabilities)
- Prisma + SQLite with 7 models

## Documentation

See the .md files in this directory:
- README.md - overview
- INSTALLATION.md - full setup
- USER_GUIDE.md - feature walkthrough
- ARCHITECTURE.md - system design
- API_DOCUMENTATION.md - every endpoint
- DATABASE_SCHEMA.md - Prisma models
- SECURITY.md - OWASP controls
- SECURITY_AUDIT_REPORT.md - security audit findings + fixes
- TESTING.md - test coverage
- CONTRIBUTING.md - code style
- CHANGELOG.md - release notes
- FINAL_ENGINEERING_REPORT.md - summary report

## Tech Stack

Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui + Prisma 6 + SQLite + Decimal.js + Zod + Vitest
