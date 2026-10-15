const isProduction = process.env.NODE_ENV === "production";

// The `__Host-` prefix makes the browser enforce Secure + Path=/ + no Domain
// attribute, preventing any subdomain from setting/overwriting the cookie.
// It requires HTTPS, so it is only used in production.
export const ACCESS_COOKIE = isProduction
  ? "__Host-tm_access_token"
  : "tm_access_token";
export const REFRESH_COOKIE = isProduction
  ? "__Host-tm_refresh_token"
  : "tm_refresh_token";

function baseCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function accessCookieOptions() {
  const ttl = Number(process.env.JWT_ACCESS_TTL ?? 900);
  return baseCookieOptions(ttl);
}

export function refreshCookieOptions() {
  const ttl = Number(process.env.JWT_REFRESH_TTL ?? 604800);
  return baseCookieOptions(ttl);
}
