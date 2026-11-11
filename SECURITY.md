# Security

This document describes the security controls implemented in the Calculator Platform, following OWASP guidance.

## Threat Model

The Calculator Platform is a **single-instance, self-hosted** application. The threat model assumes:
- A single trusted user (or a small set of trusted users on a private network).
- No multi-tenant isolation requirements.
- The deployment environment has filesystem persistence (NOT serverless).

## Controls

### 1. Input Validation (OWASP A03:2021 — Injection)

**Zod schemas** validate every API payload before it reaches the database:

| Endpoint            | Schema                            | File                          |
| ------------------- | --------------------------------- | ----------------------------- |
| `/api/history` POST  | `evaluateRequestSchema`           | `src/lib/validation/expression.ts` |
| `/api/history` PUT   | bulk import array schema          | inline in route handler       |
| `/api/settings` PUT  | `settingsSchema`                  | `src/lib/validation/settings.ts` |
| `/api/themes` POST   | `themeConfigSchema`               | `src/lib/validation/theme.ts` |
| `/api/themes/import` POST | `themeConfigSchema`           | `src/lib/validation/theme.ts` |
| `/api/images` POST   | magic-byte + size + dimension     | `src/lib/validation/image.ts` |
| `/api/recovery` POST | `snapshotPayloadSchema`           | `src/services/recovery-service.ts` |
| `/api/evaluate` POST | `evaluateRequestSchema`            | `src/lib/validation/expression.ts` |

Validation runs on the **server** even when the client also validates — defense in depth.

### 2. SQL Injection

Prisma's parameterized query API is used everywhere. **No raw SQL** is constructed from user input. The repositories (`src/repositories/`) are the only place Prisma is called, keeping database access centralized and auditable.

### 3. XSS (Cross-Site Scripting)

- **Strict Content-Security-Policy**:
  ```
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self' data:;
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
  ```
  - No remote scripts (no CDN dependencies for core functionality).
  - `unsafe-inline` for scripts/styles is required by Next.js hydration + Tailwind.
  - `frame-ancestors 'none'` prevents clickjacking.

- **No `dangerouslySetInnerHTML`** anywhere in the codebase.
- **React escapes** all interpolated values by default.
- Imported themes are JSON-only — **no JS/CSS/HTML is ever executed** from user input.

### 4. CSRF (Cross-Site Request Forgery)

The application uses **same-origin requests by default**. The `Referrer-Policy: strict-origin-when-cross-origin` header ensures the server can verify the origin of mutating requests.

For a production deployment behind a reverse proxy, also configure:
- `SameSite=Lax` (or `Strict`) cookies
- `Secure` flag on cookies in HTTPS
- Origin validation on POST/PUT/DELETE endpoints (compare `Origin` header against allowed hosts)

### 5. Path Traversal

Uploaded files are stored in `storage/uploads/` using **randomized internal filenames** (16-byte hex). The user-supplied filename is sanitized (path components stripped, unsafe characters replaced with `_`) and stored only as metadata.

The `isPathSafe(base, target)` helper in `src/lib/storage/paths.ts` verifies that resolved file paths remain inside the storage directory. Every image-serving endpoint checks this before reading from disk.

### 6. File Upload Security

The `/api/images` POST endpoint enforces:

1. **File size limit** (5 MB default, configurable via `MAX_IMAGE_SIZE_BYTES`).
2. **Dimension limit** (≤ 4000 × 4000 pixels).
3. **Total pixel count limit** (≤ 16 M pixels).
4. **Magic-byte verification** — the actual file type is detected by inspecting the first few bytes:
   - PNG: `89 50 4E 47`
   - JPEG: `FF D8 FF`
   - WebP: `52 49 46 46` + `57 45 42 50` (at offset 8)
   - GIF: `47 49 46 38`
   
   The client-provided `Content-Type` header is **never trusted** — only the magic bytes determine the accepted MIME type.
5. **Image decode validation** — `sharp` is called to decode the image; truncated or malformed files fail at this step.
6. **Randomized filename** — the internal storage filename is `crypto.randomBytes(16).toString("hex") + ext`, never the user-supplied name.
7. **Path safety check** — the resolved file path is verified to be inside `storage/uploads/`.
8. **Storage outside `public/`** — uploaded files are NEVER placed in `public/`. They are served via `/api/images/[id]` which sets proper `Content-Type`, `Content-Disposition: inline`, and `Cache-Control: private, max-age=3600` headers.

### 7. Rate Limiting

A **token-bucket rate limiter** (`src/lib/security/rate-limit.ts`) limits each IP to **60 requests per minute** by default (configurable via `RATE_LIMIT_PER_MIN`).

- Applies only to `/api/*` requests (not static assets, not the calculator's button presses which are entirely client-side).
- When exceeded, returns `429 Too Many Requests` with `Retry-After` header and `X-RateLimit-*` headers on successful responses.
- Bucket state is in-memory (suitable for single-instance deployment — **not** for distributed deployments, see Limitations below).

### 8. Theme Import Safety

Themes are imported as **JSON only**. The `themeConfigSchema` validates:
- All color values match `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$` or `rgba(...)` or `transparent`.
- All sizing values are within bounds (e.g. `cornerRadius: 0–32`).
- No JavaScript, no HTML, no CSS rules — only structured data.
- The configuration is stored in the database as a JSON string and parsed back when loaded. **No theme content is ever executed.**

### 9. SSRF (Server-Side Request Forgery)

The application **does not download remote images**. The default `/api/images` endpoint only accepts multipart uploads.

If remote image imports are added in the future, the following controls MUST be implemented:
- Restrict protocols to `http:` and `https:` only.
- Block private IP ranges (RFC 1918, link-local, loopback).
- Block cloud metadata endpoints (`169.254.169.254`).
- Validate DNS resolution (reject if it resolves to a private IP).
- Revalidate redirects.
- Apply timeouts (≤ 10 s connect, ≤ 30 s total).
- Restrict outbound destinations via firewall rules.

### 10. Security Headers

Every response includes:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
X-DNS-Prefetch-Control: off
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Content-Security-Policy: <see above>
```

### 11. Error Handling

- The math engine raises **typed errors** with human-readable messages. No internal stack traces are exposed to the UI — only the error message.
- API routes catch all exceptions and return `{ "error": "..." }` with HTTP 400 or 500. The error message is generic for 500s (logged server-side; not exposed to the client).
- Database errors are caught at the service layer and converted to user-friendly messages.

### 12. Cookie Policy

Cookies are used **only** for suitable small preferences or session-related data (NOT as a database). The application does not set cookies by default. If session features are added later:
- `SameSite=Lax` (or `Strict`) attribute.
- `Secure` flag in HTTPS production.
- `HttpOnly` flag for any sensitive cookies.

## Test Coverage

The math engine has **109 vitest tests** covering edge cases that have security implications:
- Division by zero
- Square root of negative numbers
- Logarithms of zero / negative numbers
- Invalid factorial operations
- Overflow detection
- Malformed expressions (unbalanced parens, double operators, unknown functions, unknown constants)
- Arity mismatches

These tests demonstrate that invalid inputs raise typed errors rather than producing incorrect numerical results.

## Security Testing Recommendations

For a full security audit, the following tests should be added (documented as future work):

### Unit tests
- [ ] Zod schema rejection of malformed payloads (every endpoint).
- [ ] Image upload rejection of: oversized files, wrong magic bytes, truncated images, dimension overflows.
- [ ] Theme import rejection of: malformed JSON, missing required fields, out-of-range values.
- [ ] Rate limiter behavior at the boundary (60th request succeeds, 61st returns 429).

### Integration tests
- [ ] SQL injection: confirm Prisma parameterizes all queries (no raw SQL with user input).
- [ ] XSS: confirm no user input is rendered unescaped.
- [ ] Path traversal: confirm `/api/images/[id]` cannot escape `storage/uploads/` via crafted IDs.
- [ ] CSRF: confirm mutating endpoints reject cross-origin requests when `Origin` header is missing or mismatched.

### E2E tests (Playwright)
- [ ] Upload a maliciously-crafted PNG with a fake `.jpg` extension — should be rejected by magic byte check.
- [ ] Import a theme JSON containing a `<script>` tag in the description — should be rejected by Zod.
- [ ] Send 100 requests in 60 seconds — should receive 429 on the 61st.
- [ ] Attempt to delete a built-in theme — should be rejected.

## Known Limitations

1. **Single-instance rate limiting:** The in-memory token bucket does not protect multi-instance deployments. For distributed deployments, use Redis or similar shared state.
2. **Serverless SQLite:** The deployment target assumes a persistent filesystem. Serverless platforms (Vercel, AWS Lambda) do NOT preserve SQLite across invocations.
3. **`unsafe-inline` in CSP:** Required for Next.js hydration and Tailwind CSS. A stricter CSP would require nonces or hashes, which are not yet implemented.
4. **No authentication:** The application assumes a trusted user. Adding authentication (NextAuth.js is installed but not configured) would introduce session management, CSRF tokens, and per-user data isolation.
5. **No HTTPS enforcement:** The application does not redirect HTTP to HTTPS. Use a reverse proxy (Caddy, Nginx) to terminate TLS.
6. **Recovery snapshot migration:** Version 1 snapshots are accepted as-is. Future schema changes will need explicit migration logic.

## Reporting Vulnerabilities

If you discover a security issue, please do not open a public issue. Document the vulnerability and proposed fix, then submit a private security advisory.
