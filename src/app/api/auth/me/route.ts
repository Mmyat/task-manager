import { ApiError } from "@/lib/api/error";
import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/session";
import { toPublicUser, userService } from "@/services/user.service";

export const GET = withApi(async () => {
  const session = await requireUser();
  const user = await userService.findById(session.id);
  if (!user) throw ApiError.unauthorized();

  return ok(toPublicUser(user));
});
