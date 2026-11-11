// src/app/api/history/route.ts
// History list / create / bulk-import endpoints.
//
// Security:
// - GET uses query-string validation via `historyQuerySchema`.
// - POST uses `evaluateRequestSchema` to validate the expression's character
//   set BEFORE it reaches the math engine — this rejects SQLi-looking strings,
//   shell metacharacters, and other non-mathematical input.
// - PUT (bulk import) validates every entry against a strict array schema.
// - All mutations require a same-origin request (enforced by the proxy).

import { NextRequest } from "next/server";
import { historyService } from "@/services/history-service";
import { jsonBody } from "@/lib/security/headers";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  evaluateRequestSchema,
  createHistoryEntrySchema,
  historyQuerySchema,
} from "@/lib/validation/expression";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const url = req.nextUrl;

  // Validate query params with Zod — rejects garbage like page=abc or
  // unknown sort values.
  const parsed = historyQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? "1",
    pageSize: url.searchParams.get("pageSize") ?? "20",
    search: url.searchParams.get("q") ?? url.searchParams.get("search") ?? undefined,
    mode: url.searchParams.get("mode") ?? undefined,
    sort: url.searchParams.get("sort") ?? "desc",
    starred: url.searchParams.get("starred") ?? undefined,
  });
  if (!parsed.success) {
    return jsonBody({ error: "Invalid query", issues: parsed.error.issues }, { status: 400 });
  }
  // historyQuerySchema uses sort=asc|desc; map to the service's
  // createdAt_asc|desc form.
  const sort =
    parsed.data.sort === "asc"
      ? ("createdAt_asc" as const)
      : ("createdAt_desc" as const);

  const result = await historyService.list({
    mode: parsed.data.mode,
    search: parsed.data.search,
    starred: parsed.data.starred,
    sort,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
  });
  return jsonBody(result);
}

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  if (!body) {
    return jsonBody({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate the expression with `evaluateRequestSchema` — its regex
  // restricts the character set to math-safe characters and rejects
  // SQL keywords, shell metacharacters, JavaScript code, etc.
  // (Even though Prisma parameterizes queries, accepting arbitrary strings
  // would let attackers store SQLi-looking payloads that could later be
  // misrendered by some downstream tool. Defense in depth.)
  const parsed = evaluateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonBody(
      { error: "Invalid expression", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // `evaluateAndStore` runs the expression through the math engine. The
  // expression is stored as text along with the computed result.
  const result = await historyService.evaluateAndStore(
    parsed.data.expression,
    body.mode ?? "standard",
    body.angleUnit ?? "rad",
  );
  return jsonBody(result, { status: 201 });
}

// Bulk import endpoint — accepts an array of complete history entries
// (with their own `result` field, no re-evaluation).
const bulkImportSchema = z
  .array(createHistoryEntrySchema)
  .max(100, "Cannot import more than 100 entries at once");

export async function PUT(req: NextRequest) {
  const limited = enforceRateLimit(req);
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  const parsed = bulkImportSchema.safeParse(body);
  if (!parsed.success) {
    return jsonBody(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  // Insert each entry via the service. (We re-use evaluateAndStore only for
  // POST; bulk import trusts the caller-provided result.)
  const inserted = [];
  for (const entry of parsed.data) {
    inserted.push(
      await historyService.evaluateAndStore(
        entry.expression,
        entry.mode,
        entry.angleUnit ?? "rad",
      ),
    );
  }
  return jsonBody({ imported: inserted.length, items: inserted }, { status: 201 });
}
