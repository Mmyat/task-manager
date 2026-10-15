import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, type NewUser, type User } from "@/db/schema";
import type { TokenUser } from "@/lib/auth/jwt";

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  role: string;
  profilePicture: string | null;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture ?? null,
  };
}

export function toTokenUser(user: {
  id: string;
  email: string;
  username: string;
  role: string;
}): TokenUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };
}

export const userService = {
  async findByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(
        and(
          sql`lower(${users.email}) = ${email.toLowerCase()}`,
          isNull(users.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(
        and(
          sql`lower(${users.username}) = ${username.toLowerCase()}`,
          isNull(users.deletedAt),
        ),
      )
      .limit(1);
    return row ?? null;
  },

  async findById(id: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);
    return row ?? null;
  },

  async create(data: NewUser): Promise<User> {
    const [row] = await db.insert(users).values(data).returning();
    return row;
  },

  /** Minimal directory used to populate assignee dropdowns. */
  async listPublic(): Promise<PublicUser[]> {
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        profilePicture: users.profilePicture,
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(users.username);
    return rows.map((row) => ({
      ...row,
      profilePicture: row.profilePicture ?? null,
    }));
  },
};
