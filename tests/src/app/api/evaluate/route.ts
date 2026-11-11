// src/app/api/evaluate/route.ts
// Stateless evaluation endpoint — does NOT persist to history. Used by the
// calculator for live preview / explicit evaluation without saving.
import { NextRequest } from "next/server";
import { jsonBody } from "@/lib/security/headers";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { evaluateRequestSchema } from "@/lib/validation/expression";
import { tryEvaluate, formatDecimal } from "@/engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  const parsed = evaluateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonBody(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const outcome = tryEvaluate(parsed.data.expression, {
    angleUnit: parsed.data.angleUnit,
  });
  return jsonBody({
    ok: outcome.ok,
    ...(outcome.ok
      ? { result: outcome.text }
      : { error: outcome.error }),
  });
}
