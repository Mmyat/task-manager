import { cookies } from "next/headers";
import { ApiError } from "@/lib/api/error";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "./cookies";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  type AuthTokenPayload,
  type TokenUser,
} from "./jwt";

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  role: string;
}

function toSessionUser(payload: AuthTokenPayload): SessionUser {
  return {
    id: payload.sub,
    email: payload.email,
    username: payload.username,
    role: payload.role,
  };
}

/** Set both auth cookies. Only valid in Route Handlers / Server Actions. */
export async function setAuthCookies(user: TokenUser) {
  const jar = await cookies();
  const [access, refresh] = await Promise.all([
    signAccessToken(user),
    signRefreshToken(user),
  ]);
  jar.set(ACCESS_COOKIE, access, accessCookieOptions());
  jar.set(REFRESH_COOKIE, refresh, refreshCookieOptions());
}

/** Remove both auth cookies. Only valid in Route Handlers / Server Actions. */
export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

/**
 * Read-only session lookup safe to call from Server Components.
 * Prefers the access token, falls back to the (long-lived) refresh token.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();

  const access = await verifyToken(jar.get(ACCESS_COOKIE)?.value, "access");
  if (access) return toSessionUser(access);

  const refresh = await verifyToken(jar.get(REFRESH_COOKIE)?.value, "refresh");
  if (refresh) return toSessionUser(refresh);

  return null;
}

/**
 * Enforce authentication inside a Route Handler. If the access token has
 * expired but the refresh token is still valid, the cookies are rotated.
 */
export async function requireUser(): Promise<SessionUser> {
  const jar = await cookies();

  const access = await verifyToken(jar.get(ACCESS_COOKIE)?.value, "access");
  if (access) return toSessionUser(access);

  const refresh = await verifyToken(jar.get(REFRESH_COOKIE)?.value, "refresh");
  if (!refresh) throw ApiError.unauthorized();

  const user = toSessionUser(refresh);
  await setAuthCookies(user);
  return user;
}

/** Enforce authentication AND role membership. */
export async function requireRole(...roles: string[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw ApiError.forbidden();
  return user;
}
