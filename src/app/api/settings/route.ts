// src/app/api/settings/route.ts
import { NextRequest } from "next/server";
import { settingsService } from "@/services/settings-service";
import { jsonBody } from "@/lib/security/headers";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { settingsSchema } from "@/lib/validation/settings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const settings = await settingsService.get();
  return jsonBody(settings);
}

export async function PUT(req: NextRequest) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonBody({ error: "Invalid settings", issues: parsed.error.issues }, { status: 400 });
  }
  const saved = await settingsService.save(parsed.data);
  return jsonBody(saved);
}

export async function DELETE(req: NextRequest) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const reset = await settingsService.reset();
  return jsonBody(reset);
}
