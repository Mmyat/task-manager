import { ApiError } from "@/lib/api/error";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { LoginInput, RegisterInput } from "@/lib/validations/auth";
import {
  toPublicUser,
  userService,
  type PublicUser,
} from "./user.service";

export const authService = {
  async register(input: RegisterInput): Promise<PublicUser> {
    const email = input.email.toLowerCase();

    if (await userService.findByEmail(email)) {
      throw ApiError.conflict("An account with that email already exists");
    }
    if (await userService.findByUsername(input.username)) {
      throw ApiError.conflict("That username is already taken");
    }

    const user = await userService.create({
      username: input.username,
      email,
      password: await hashPassword(input.password),
      role: "user",
    });

    return toPublicUser(user);
  },

  async login(input: LoginInput): Promise<PublicUser> {
    const user = await userService.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const valid = await verifyPassword(input.password, user.password);
    if (!valid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    return toPublicUser(user);
  },
};
