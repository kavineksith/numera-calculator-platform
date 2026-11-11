// src/app/api/csrf/route.ts
// Returns a CSRF token to the client (set as a cookie). State-changing
// requests should send this back in the x-csrf-token header.
import { NextRequest } from "next/server";
import { ensureCsrfToken, CSRF_COOKIE } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = ensureCsrfToken(req);
  return new Response(JSON.stringify({ token }), {
    headers: {
      "content-type": "application/json",
      "set-cookie": `${CSRF_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
    },
  });
}
