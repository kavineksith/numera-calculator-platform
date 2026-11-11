// src/app/api/export/route.ts

import { NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers";
import { exportAllData } from "@/services/export-service";

export async function GET() {
  const data = await exportAllData();
  const json = JSON.stringify(data, null, 2);
  const r = new NextResponse(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="calculator-export-${Date.now()}.json"`,
    },
  });
  applySecurityHeaders(r.headers);
  return r;
}
