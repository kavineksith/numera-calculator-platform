// src/app/api/themes/route.ts
//
// Security:
// - GET seeds built-in themes on first call (idempotent).
// - POST validates the request body against `themeConfigSchema`, which
//   constrains color values to hex/rgba and bounds all numeric fields.
// - The theme `name` is additionally checked against a "no HTML" pattern to
//   reject `<script>` and similar tags even though they would be escaped by
//   React on render (defense in depth).
// - Errors are caught and returned as 400 (not leaked as 500).

import { NextRequest } from "next/server";
import { themeService } from "@/services/theme-service";
import { jsonBody } from "@/lib/security/headers";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { themeConfigSchema } from "@/lib/validation/theme";

export const dynamic = "force-dynamic";

// Theme names must be plain text — no HTML tags (defense in depth, even
// though React escapes on render).
const SAFE_NAME_PATTERN = /^[^<>{}\\]*$/;

export async function GET(req: NextRequest) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  // Seed built-ins lazily on first request.
  await themeService.seedBuiltIns();
  const themes = await themeService.list();
  return jsonBody({
    themes: themes.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      isBuiltIn: t.isBuiltIn,
      category: t.category,
      configuration: t.configuration,
    })),
  });
}

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  const parsed = themeConfigSchema.safeParse(body);
  if (!parsed.success) {
    return jsonBody(
      { error: "Invalid theme", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  // Defense in depth: reject names containing HTML special characters.
  if (!SAFE_NAME_PATTERN.test(parsed.data.name)) {
    return jsonBody(
      { error: "Theme name cannot contain HTML tags or curly braces" },
      { status: 400 },
    );
  }
  try {
    const created = await themeService.create(parsed.data);
    return jsonBody(created, { status: 201 });
  } catch (err) {
    // Catch service-layer errors (e.g. name collision) and return them as
    // 400 Bad Request instead of leaking a 500.
    return jsonBody(
      {
        error:
          err instanceof Error ? err.message : "Failed to create theme",
      },
      { status: 400 },
    );
  }
}
