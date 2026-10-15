import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/session";
import { userService } from "@/services/user.service";

/** Directory of users, used to populate assignee selectors. */
export const GET = withApi(async () => {
  await requireUser();
  const users = await userService.listPublic();
  return ok(users);
});
