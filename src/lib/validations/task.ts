import { z } from "zod";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/types";

/** Accepts an ISO string (or yyyy-mm-dd) and normalizes it to a Date. */
const dueDateField = z
  .union([z.string(), z.null()])
  .transform((value, ctx) => {
    if (value === null) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid date" });
      return z.NEVER;
    }
    return date;
  });

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
  description: z.string().trim().max(5000).optional().nullable(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: dueDateField.optional(),
  assignedToUserId: z.uuid("Invalid user id").optional().nullable(),
  category: z.string().trim().max(50).optional().nullable(),
  attachmentUrl: z
    .union([z.url("Invalid URL"), z.literal("")])
    .optional()
    .nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  completed: z.boolean().optional(),
});

export const taskQuerySchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  search: z.string().trim().max(255).optional(),
  assignedToUserId: z.uuid().optional(),
  scope: z.enum(["all", "assigned", "created"]).optional(),
  sort: z
    .enum(["createdAt", "updatedAt", "dueDate", "priority", "title"])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;

export { TASK_PRIORITIES, TASK_STATUSES };
