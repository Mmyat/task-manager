import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * Edge-compatible JWT helpers (only depends on `jose`, no Node APIs) so the
 * same code can run inside `middleware.ts` and inside route handlers.
 */

const encoder = new TextEncoder();
const ALG = "HS256";

export type TokenType = "access" | "refresh";

export interface TokenUser {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface AuthTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
  type: TokenType;
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET must be set and at least 16 characters long");
  }
  return encoder.encode(secret);
}

function accessTtl() {
  return Number(process.env.JWT_ACCESS_TTL ?? 900);
}

function refreshTtl() {
  return Number(process.env.JWT_REFRESH_TTL ?? 604800);
}

async function sign(user: TokenUser, type: TokenType, ttlSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    email: user.email,
    username: user.username,
    role: user.role,
    type,
  })
    .setProtectedHeader({ alg: ALG })
    .setSubject(user.id)
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(getSecret());
}

export function signAccessToken(user: TokenUser) {
  return sign(user, "access", accessTtl());
}

export function signRefreshToken(user: TokenUser) {
  return sign(user, "refresh", refreshTtl());
}

export async function verifyToken(
  token: string | undefined,
  expectedType: TokenType,
): Promise<AuthTokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [ALG],
    });
    if (payload.type !== expectedType || typeof payload.sub !== "string") {
      return null;
    }
    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}
