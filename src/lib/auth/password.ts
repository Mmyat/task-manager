import { compare, hash } from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hashed: string) {
  return compare(password, hashed);
}
