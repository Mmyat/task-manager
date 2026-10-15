import { withApi } from "@/lib/api/handler";
import { noContent, ok } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/session";
import { updateTaskSchema } from "@/lib/validations/task";
import { taskService } from "@/services/task.service";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withApi<RouteParams>(async (_request, { params }) => {
  const actor = await requireUser();
  const { id } = await params;

  const task = await taskService.getById(actor, id);
  return ok(task);
});

export const PATCH = withApi<RouteParams>(async (request, { params }) => {
  const actor = await requireUser();
  const { id } = await params;
  const body = updateTaskSchema.parse(await request.json());

  const task = await taskService.update(actor, id, body);
  return ok(task);
});

export const DELETE = withApi<RouteParams>(async (_request, { params }) => {
  const actor = await requireUser();
  const { id } = await params;

  await taskService.remove(actor, id);
  return noContent();
});
