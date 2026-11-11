// src/app/api/images/route.ts

import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers";
import { uploadImage, listAllImages } from "@/services/image-service";

export async function GET() {
  const images = await listAllImages();
  const r = NextResponse.json({ images });
  applySecurityHeaders(r.headers);
  return r;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      const r = NextResponse.json({ error: "Missing 'file' field in form data" }, { status: 400 });
      applySecurityHeaders(r.headers);
      return r;
    }
    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const result = await uploadImage(buffer, file.name || "upload", file.type || "application/octet-stream");
    const r = NextResponse.json(result, { status: 201 });
    applySecurityHeaders(r.headers);
    return r;
  } catch (e) {
    const r = NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 400 }
    );
    applySecurityHeaders(r.headers);
    return r;
  }
}
