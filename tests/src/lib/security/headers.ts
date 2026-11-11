// src/lib/security/headers.ts
// Security headers + helper to build a JSON response with security headers
// applied uniformly across all API routes.

import { NextResponse } from "next/server";

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  "X-DNS-Prefetch-Control": "off",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

// Strict Content Security Policy.
// Inline styles + scripts are required by Next.js for hydration + Tailwind.
// Image data: URLs are allowed so user-uploaded background previews can render.
export const CSP_POLICY = [
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

/**
 * Recursively walk a value and HTML-escape `<`, `>`, and `&` in any string
 * fields. This is defense-in-depth against reflected XSS via JSON endpoints:
 * even though React escapes strings on render, returning raw `<script>` tags
 * in JSON makes the API consumable by other clients (curl, server-side
 * templates) that may not escape properly.
 *
 * After this escape, JSON.parse(text) on the client will return strings with
 * the literal characters `<`, `>` — so React rendering is unaffected.
 */
function sanitizeJsonValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeJsonValue);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      // Skip __proto__ / constructor keys to prevent prototype pollution.
      if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
      out[k] = sanitizeJsonValue(v);
    }
    return out;
  }
  return value;
}

/** Apply security headers to a Headers object (used by API routes). */
export function applySecurityHeaders(headers: Headers): void {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    headers.set(k, v);
  }
  headers.set("Content-Security-Policy", CSP_POLICY);
}

/**
 * Build a JSON NextResponse with security headers attached AND HTML-escaped
 * string payloads. Use this for every API response so CSP / X-Frame-Options
 * etc. are applied uniformly and reflected XSS via JSON is mitigated.
 */
export function jsonBody(
  payload: unknown,
  init?: ResponseInit,
): NextResponse {
  const sanitized = sanitizeJsonValue(payload);
  const res = NextResponse.json(sanitized, init);
  applySecurityHeaders(res.headers);
  return res;
}

