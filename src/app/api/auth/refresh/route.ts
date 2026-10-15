import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/session";

/**
 * Rotates the session. `requireUser` re-issues auth cookies when the access
 * token has expired but the refresh token is still valid.
 */
export const POST = withApi(async () => {
  const user = await requireUser();
  return ok(user);
});
