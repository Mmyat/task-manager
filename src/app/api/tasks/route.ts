import type { NextRequest } from "next/server";
import { withApi } from "@/lib/api/handler";
import { created, ok } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/session";
import { createTaskSchema, taskQuerySchema } from "@/lib/validations/task";
import { taskService } from "@/services/task.service";

export const GET = withApi(async (request: NextRequest) => {
  const actor = await requireUser();

  const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters = taskQuerySchema.parse(raw);

  const tasks = await taskService.list(actor, filters);
  return ok(tasks);
});

export const POST = withApi(async (request: NextRequest) => {
  const actor = await requireUser();
  const body = createTaskSchema.parse(await request.json());

  const task = await taskService.create(actor, body);
  return created(task);
});
