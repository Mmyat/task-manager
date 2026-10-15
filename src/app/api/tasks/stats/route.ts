import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/http";
import { requireUser } from "@/lib/auth/session";
import { taskService } from "@/services/task.service";

export const GET = withApi(async () => {
  const actor = await requireUser();
  const stats = await taskService.stats(actor);
  return ok(stats);
});
