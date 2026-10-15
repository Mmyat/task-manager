import type { NextRequest } from "next/server";
import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/http";
import { setAuthCookies } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";
import { toTokenUser } from "@/services/user.service";

export const POST = withApi(async (request: NextRequest) => {
  const body = loginSchema.parse(await request.json());
  const user = await authService.login(body);

  await setAuthCookies(toTokenUser(user));

  return ok(user);
});
