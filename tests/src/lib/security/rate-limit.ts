// src/lib/security/rate-limit.ts
// Simple in-memory token-bucket rate limiter for a single-instance deployment.
//
// NOTE: For a distributed / multi-instance deployment this would NOT be
// sufficient — a shared store (Redis, etc.) would be required. The master
// prompt's deployment target is single-instance self-hosted, so this is fine.
// See SECURITY.md for the documented limitation.

import { NextResponse, type NextRequest } from "next/server";
import { jsonBody } from "./headers";

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  key: string;
  maxPerMinute: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetInMs: number;
  limit: number;
}

const WINDOW_MS = 60_000;

/** Consume 1 token. Returns false if limit exceeded. */
export function rateLimit(opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(opts.key);

  if (!bucket) {
    buckets.set(opts.key, { tokens: opts.maxPerMinute - 1, lastRefill: now });
    return {
      ok: true,
      remaining: opts.maxPerMinute - 1,
      resetInMs: WINDOW_MS,
      limit: opts.maxPerMinute,
    };
  }

  // Refill proportionally based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const refill = Math.min(opts.maxPerMinute, (elapsed / WINDOW_MS) * opts.maxPerMinute);
  bucket.tokens = Math.min(opts.maxPerMinute, bucket.tokens + refill);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    return {
      ok: false,
      remaining: 0,
      resetInMs: Math.ceil(WINDOW_MS - elapsed),
      limit: opts.maxPerMinute,
    };
  }

  bucket.tokens -= 1;
  return {
    ok: true,
    remaining: Math.floor(bucket.tokens),
    resetInMs: WINDOW_MS,
    limit: opts.maxPerMinute,
  };
}

/**
 * Convenience helper for API routes: extract IP from common headers, apply
 * the rate limit, and return a 429 NextResponse if exceeded.
 * Returns `null` if the request is allowed (caller continues processing).
 */
export function enforceRateLimit(
  req: NextRequest,
  maxPerMinute: number = Number(process.env.RATE_LIMIT_PER_MIN ?? 60),
): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";
  const r = rateLimit({ key: `api:${ip}`, maxPerMinute });
  if (!r.ok) {
    return jsonBody(
      { error: "Too many requests", retryAfter: r.resetInMs },
      { status: 429 },
    );
  }
  return null;
}

/** Periodic cleanup so we don't grow the map unboundedly. Call every few minutes. */
export function cleanupRateLimit(maxAgeMs = 5 * 60_000): void {
  const now = Date.now();
  for (const [key, b] of buckets) {
    if (now - b.lastRefill > maxAgeMs) buckets.delete(key);
  }
}
