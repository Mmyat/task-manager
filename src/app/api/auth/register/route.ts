import type { NextRequest } from "next/server";
import { withApi } from "@/lib/api/handler";
import { created } from "@/lib/api/http";
import { setAuthCookies } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";
import { toTokenUser } from "@/services/user.service";

export const POST = withApi(async (request: NextRequest) => {
  const body = registerSchema.parse(await request.json());
  const user = await authService.register(body);

  await setAuthCookies(toTokenUser(user));

  return created(user);
});
