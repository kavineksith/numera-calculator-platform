// src/app/api/history/[id]/route.ts
//
// Security:
// - DELETE /api/history/all requires a `confirm: true` field in the JSON body.
//   This prevents a CSRF attacker from trivially wiping all history (even
//   if they bypass the proxy's Origin check, they cannot guess the body
//   field name unless they can read the response of a preflight).
// - All mutations run through the proxy which validates Origin.
// - GET/DELETE return only items matching the supplied id (no IDOR possible
//   since there is no per-user data partitioning in this single-user app).

import { NextRequest } from "next/server";
import { historyService } from "@/services/history-service";
import { jsonBody } from "@/lib/security/headers";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const { id } = await params;
  // Reject IDs that look like path traversal attempts early.
  if (id.includes("..") || id.includes("/") || id.includes("\\")) {
    return jsonBody({ error: "Invalid id" }, { status: 400 });
  }
  const item = await historyService.get(id);
  if (!item) return jsonBody({ error: "Not found" }, { status: 404 });
  return jsonBody(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const { id } = await params;
  if (id.includes("..") || id.includes("/") || id.includes("\\")) {
    return jsonBody({ error: "Invalid id" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  if (body.starred !== undefined) {
    const item = await historyService.toggleStar(id);
    return jsonBody(item ?? { error: "Not found" }, { status: item ? 200 : 404 });
  }
  return jsonBody({ error: "Nothing to update" }, { status: 400 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const { id } = await params;
  if (id.includes("..") || id.includes("/") || id.includes("\\")) {
    return jsonBody({ error: "Invalid id" }, { status: 400 });
  }

  // Destructive "clear all" operation requires explicit confirmation in the
  // body. This is a second layer of defense beyond the proxy's Origin check:
  // an attacker who can issue a cross-site DELETE (e.g. via a CORS
  // misconfiguration elsewhere) cannot wipe history without also being able
  // to read the response of a preflight — which the proxy blocks.
  if (id === "all") {
    const body = await req.json().catch(() => ({}));
    if (!body || body.confirm !== true) {
      return jsonBody(
        {
          error: "Confirmation required",
          message: "Send { confirm: true } in the request body to clear all history.",
        },
        { status: 400 },
      );
    }
    await historyService.clearAll();
    return jsonBody({ cleared: true });
  }
  await historyService.delete(id);
  return jsonBody({ deleted: id });
}
