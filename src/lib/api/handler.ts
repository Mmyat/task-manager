import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./error";
import { fail } from "./http";

type RouteContext = { params: Promise<Record<string, string>> };

type ApiHandler<Ctx> = (
  request: NextRequest,
  context: Ctx,
) => Promise<Response> | Response;

/**
 * Wraps a route handler with consistent error handling:
 *  - `ApiError`      -> its declared status/code
 *  - `ZodError`      -> 400 with field-level details
 *  - anything else   -> 500 (logged)
 */
export function withApi<Ctx = RouteContext>(handler: ApiHandler<Ctx>) {
  return async (request: NextRequest, context: Ctx): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.status, error.code, error.message, error.details);
      }

      if (error instanceof ZodError) {
        return fail(
          400,
          "VALIDATION_ERROR",
          "The submitted data is invalid",
          error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        );
      }

      console.error("[api] Unhandled error:", error);
      return fail(500, "INTERNAL_ERROR", "Something went wrong");
    }
  };
}
