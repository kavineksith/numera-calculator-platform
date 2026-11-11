// src/app/api/health/route.ts
import { jsonBody } from "@/lib/security/headers";

export async function GET() {
  return jsonBody({
    status: "ok",
    service: "calculator-platform",
    time: new Date().toISOString(),
    version: "0.1.0",
  });
}
