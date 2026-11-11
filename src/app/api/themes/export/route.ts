// src/app/api/themes/export/route.ts
import { NextRequest } from "next/server";
import { themeService } from "@/services/theme-service";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const themes = await themeService.exportAll();
  return new Response(JSON.stringify({ version: 1, themes }, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": 'attachment; filename="calculator-themes.json"',
    },
  });
}
