import { NextResponse } from "next/server";

import { getCurrentAdmin } from "./auth";
import type { AdminUser } from "./types";

/**
 * Guard for admin-only API routes.
 * Returns either the signed-in admin or a ready-to-return 401 response.
 */
export async function requireAdmin(): Promise<
  { admin: AdminUser; response?: never } | { admin?: never; response: NextResponse }
> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return {
      response: NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      ),
    };
  }
  return { admin };
}
