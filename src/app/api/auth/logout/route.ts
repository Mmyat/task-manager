import { withApi } from "@/lib/api/handler";
import { noContent } from "@/lib/api/http";
import { clearAuthCookies } from "@/lib/auth/session";

export const POST = withApi(async () => {
  await clearAuthCookies();
  return noContent();
});
