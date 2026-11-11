// src/app/api/themes/import/route.ts
import { NextRequest } from "next/server";
import { themeService } from "@/services/theme-service";
import { jsonBody } from "@/lib/security/headers";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  const overwrite = typeof body?.overwrite === "boolean" ? body.overwrite : false;
  const payload = body?.theme ?? body;
  try {
    const imported = await themeService.importTheme(payload, overwrite);
    return jsonBody({ imported: true, theme: imported }, { status: 201 });
  } catch (err) {
    return jsonBody(
      {
        imported: false,
        error: err instanceof Error ? err.message : "Invalid theme",
      },
      { status: 400 },
    );
  }
}
