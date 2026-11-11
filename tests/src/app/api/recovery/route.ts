// src/app/api/recovery/route.ts

import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers";
import { getLatest, save, clear, snapshotPayloadSchema } from "@/services/recovery-service";

export async function GET() {
  const snapshot = await getLatest();
  const r = NextResponse.json({ snapshot, found: snapshot !== null });
  applySecurityHeaders(r.headers);
  return r;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = snapshotPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const r = NextResponse.json(
      { error: "Invalid snapshot payload", details: parsed.error.flatten() },
      { status: 400 }
    );
    applySecurityHeaders(r.headers);
    return r;
  }
  await save(parsed.data, "manual");
  const r = NextResponse.json({ saved: true });
  applySecurityHeaders(r.headers);
  return r;
}

export async function DELETE() {
  await clear();
  const r = NextResponse.json({ cleared: true });
  applySecurityHeaders(r.headers);
  return r;
}
