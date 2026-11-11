// src/app/api/images/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers";
import { getImageFile, removeImage } from "@/services/image-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const file = await getImageFile(id);
  if (!file) {
    const r = NextResponse.json({ error: "Not found" }, { status: 404 });
    applySecurityHeaders(r.headers);
    return r;
  }
  const r = new NextResponse(file.buffer, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename="${file.filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
  applySecurityHeaders(r.headers);
  return r;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await removeImage(id);
  if (!ok) {
    const r = NextResponse.json({ error: "Not found" }, { status: 404 });
    applySecurityHeaders(r.headers);
    return r;
  }
  const r = NextResponse.json({ deleted: true });
  applySecurityHeaders(r.headers);
  return r;
}
