// src/lib/security/csrf.ts
// Lightweight CSRF helper: returns a token derived from a session cookie (or
// generates one) and validates it on state-changing requests. Because this
// app is single-user and same-origin, we use the double-submit pattern.

import { randomUUID } from "node:crypto";

const COOKIE_NAME = "calc_csrf";
const HEADER_NAME = "x-csrf-token";

export function ensureCsrfToken(req: Request): string {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (match && match[1]) return match[1];
  return randomUUID();
}

export function validateCsrf(req: Request): boolean {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const header = req.headers.get(HEADER_NAME);
  if (!match || !match[1] || !header) return false;
  // Constant-time-ish comparison (lengths equal first).
  if (match[1].length !== header.length) return false;
  let diff = 0;
  for (let i = 0; i < match[1].length; i++) {
    diff |= match[1].charCodeAt(i) ^ header.charCodeAt(i);
  }
  return diff === 0;
}

export const CSRF_COOKIE = COOKIE_NAME;
export const CSRF_HEADER = HEADER_NAME;
