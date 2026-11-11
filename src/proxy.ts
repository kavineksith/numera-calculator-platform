// src/proxy.ts
// Next.js 16 "proxy" (formerly "middleware"): applies security headers,
// per-IP rate-limit budget on API routes, CSRF protection on mutations,
// and rejects dangerous HTTP methods.
//
// Note: in Next.js 16 the `middleware.ts` convention was renamed to `proxy.ts`
// and the exported function must be named `proxy` (not `middleware`).

import { NextResponse, type NextRequest } from "next/server";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  "X-XSS-Protection": "1; mode=block",
  // Cross-Origin isolation headers — prevent cross-origin window interaction
  // and limit which origins can read subresources. Required by some modern
  // browser features (SharedArrayBuffer) and a defense against Spectre-class
  // side-channel attacks that try to read sensitive data via cross-origin iframes.
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-DNS-Prefetch-Control": "off",
};

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// In-memory rate limiter state shared across requests within an instance.
const buckets = new Map<string, { tokens: number; last: number }>();
const PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN ?? 60);

function rateCheck(key: string): { ok: boolean; remaining: number } {
  const refill = PER_MIN / 60_000;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b) {
    buckets.set(key, { tokens: PER_MIN - 1, last: now });
    return { ok: true, remaining: PER_MIN - 1 };
  }
  b.tokens = Math.min(PER_MIN, b.tokens + (now - b.last) * refill);
  b.last = now;
  if (b.tokens < 1) return { ok: false, remaining: 0 };
  b.tokens -= 1;
  return { ok: true, remaining: Math.floor(b.tokens) };
}

// The application is single-origin (no legitimate cross-site mutation
// requests). For deployments that host the calculator on a different origin
// than the API (e.g. CDN-fronted), add the public origin here.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Validate the Origin of a mutating request. Returns true if the request
 * is from a same-origin context or an explicitly-allowed origin.
 *
 * Same-origin requests always carry an Origin OR Referer header that matches
 * the server's host. Cross-site form submissions / fetches carry an Origin
 * from the attacker's site — those should be rejected.
 */
function isOriginAllowed(req: NextRequest): boolean {
  // If no allowed origins are configured, we still allow same-origin
  // requests (Origin matches the Host header, or no Origin which means
  // same-origin user-agent).
  const method = req.method.toUpperCase();
  // Only mutating methods need CSRF protection.
  if (method !== "POST" && method !== "PUT" && method !== "PATCH" && method !== "DELETE") {
    return true;
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  // No Origin header AND no Referer: same-origin user-agents (curl, some
  // native clients) typically omit both. Accept these for now — they're
  // not CSRF attacks (a CSRF requires a browser-set Origin/Referer from a
  // cross-origin context).
  if (!origin && !referer) return true;

  // Check Origin against Host.
  if (origin) {
    try {
      const url = new URL(origin);
      if (host && url.host === host) return true;
      if (ALLOWED_ORIGINS.includes(url.host) || ALLOWED_ORIGINS.includes(origin)) {
        return true;
      }
    } catch {
      // Malformed Origin — reject defensively.
      return false;
    }
    return false;
  }

  // Fall back to Referer check.
  if (referer) {
    try {
      const url = new URL(referer);
      if (host && url.host === host) return true;
      if (ALLOWED_ORIGINS.includes(url.host)) return true;
    } catch {
      return false;
    }
    return false;
  }

  return true;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets & Next.js internals.
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname === "/favicon.ico" ||
    pathname === "/sw.js" ||
    pathname === "/logo.svg" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  // Block dangerous HTTP methods that should never reach the app.
  // (TRACE is for network debugging; CONNECT is for tunneling; PATCH
  // is allowed because we use it for starring history items.)
  const allowedMethods = new Set(["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]);
  if (!allowedMethods.has(req.method.toUpperCase())) {
    return new NextResponse(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "content-type": "application/json", allow: "GET, HEAD, OPTIONS, POST, PUT, PATCH, DELETE" },
      },
    );
  }

  // CSRF protection: validate Origin on mutations.
  if (!isOriginAllowed(req)) {
    return new NextResponse(
      JSON.stringify({ error: "Cross-origin request rejected" }),
      {
        status: 403,
        headers: { "content-type": "application/json" },
      },
    );
  }

  const res = NextResponse.next();

  // Rate-limit only API routes.
  if (pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "anonymous";
    const r = rateCheck(ip);
    if (!r.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: {
            "content-type": "application/json",
            "retry-after": "60",
          },
        },
      );
    }
    res.headers.set("x-ratelimit-limit", String(PER_MIN));
    res.headers.set("x-ratelimit-remaining", String(r.remaining));
  }

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  res.headers.set("Content-Security-Policy", CSP);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
