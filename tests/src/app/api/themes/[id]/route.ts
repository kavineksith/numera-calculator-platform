// src/app/api/themes/[id]/route.ts
import { NextRequest } from "next/server";
import { themeService } from "@/services/theme-service";
import { jsonBody } from "@/lib/security/headers";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { themeConfigSchema } from "@/lib/validation/theme";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const { id } = await params;
  const theme = await themeService.get(id);
  if (!theme) return jsonBody({ error: "Not found" }, { status: 404 });
  return jsonBody(theme);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const { id } = await params;
  if (id.includes("..") || id.includes("/") || id.includes("\\")) {
    return jsonBody({ error: "Invalid id" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  const parsed = themeConfigSchema.safeParse(body);
  if (!parsed.success) {
    return jsonBody({ error: "Invalid theme", issues: parsed.error.issues }, { status: 400 });
  }
  try {
    const updated = await themeService.update(id, parsed.data);
    return jsonBody(updated);
  } catch (err) {
    return jsonBody(
      { error: err instanceof Error ? err.message : "Failed to update theme" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const { id } = await params;
  if (id.includes("..") || id.includes("/") || id.includes("\\")) {
    return jsonBody({ error: "Invalid id" }, { status: 400 });
  }
  try {
    await themeService.delete(id);
    return jsonBody({ deleted: id });
  } catch (err) {
    return jsonBody(
      { error: err instanceof Error ? err.message : "Could not delete" },
      { status: 400 },
    );
  }
}
