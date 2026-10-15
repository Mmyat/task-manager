import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNull,
  lt,
  ne,
  or,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import { todos, type NewTodo, type Todo, type TodoStatus } from "@/db/schema";
import { ApiError } from "@/lib/api/error";
import type { SessionUser } from "@/lib/auth/session";
import type {
  CreateTaskInput,
  TaskQuery,
  UpdateTaskInput,
} from "@/lib/validations/task";

const SORT_COLUMNS = {
  createdAt: todos.createdAt,
  updatedAt: todos.updatedAt,
  dueDate: todos.dueDate,
  priority: todos.priority,
  title: todos.title,
} as const;

export interface TaskStats {
  total: number;
  byStatus: Record<TodoStatus, number>;
  overdue: number;
}

function isElevated(actor: SessionUser) {
  return actor.role === "admin" || actor.role === "manager";
}

function visibilityCondition(
  actor: SessionUser,
  scope: TaskQuery["scope"],
): SQL | undefined {
  if (scope === "assigned") return eq(todos.assignedToUserId, actor.id);
  if (scope === "created") return eq(todos.createdByUserId, actor.id);
  if (isElevated(actor)) return undefined;
  return or(
    eq(todos.createdByUserId, actor.id),
    eq(todos.assignedToUserId, actor.id),
  );
}

function assertCanView(actor: SessionUser, task: Todo) {
  if (isElevated(actor)) return;
  if (task.createdByUserId === actor.id || task.assignedToUserId === actor.id) {
    return;
  }
  throw ApiError.forbidden("You do not have access to this task");
}

function assertCanDelete(actor: SessionUser, task: Todo) {
  if (isElevated(actor) || task.createdByUserId === actor.id) return;
  throw ApiError.forbidden("Only the task owner can delete this task");
}

/** Maps validated input to a Drizzle insert/update payload. */
function mapInput(
  input: CreateTaskInput | UpdateTaskInput,
): Partial<NewTodo> {
  const patch: Partial<NewTodo> = {};

  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description ?? null;
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate;
  if (input.assignedToUserId !== undefined) {
    patch.assignedToUserId = input.assignedToUserId ?? null;
  }
  if (input.category !== undefined) patch.category = input.category ?? null;
  if (input.attachmentUrl !== undefined) {
    patch.attachmentUrl = input.attachmentUrl ? input.attachmentUrl : null;
  }

  return patch;
}

export const taskService = {
  async list(actor: SessionUser, filters: TaskQuery): Promise<Todo[]> {
    const conditions: SQL[] = [isNull(todos.deletedAt)];

    if (filters.status) conditions.push(eq(todos.status, filters.status));
    if (filters.priority) conditions.push(eq(todos.priority, filters.priority));
    if (filters.assignedToUserId) {
      conditions.push(eq(todos.assignedToUserId, filters.assignedToUserId));
    }
    if (filters.search) {
      const term = `%${filters.search}%`;
      const search = or(
        ilike(todos.title, term),
        ilike(todos.description, term),
        ilike(todos.category, term),
      );
      if (search) conditions.push(search);
    }

    const visibility = visibilityCondition(actor, filters.scope);
    if (visibility) conditions.push(visibility);

    const column = SORT_COLUMNS[filters.sort ?? "createdAt"];
    const order = filters.order === "asc" ? asc : desc;

    return db
      .select()
      .from(todos)
      .where(and(...conditions))
      .orderBy(order(column))
      .limit(200);
  },

  async getById(actor: SessionUser, id: string): Promise<Todo> {
    const [task] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), isNull(todos.deletedAt)))
      .limit(1);

    if (!task) throw ApiError.notFound("Task not found");
    assertCanView(actor, task);
    return task;
  },

  async create(actor: SessionUser, input: CreateTaskInput): Promise<Todo> {
    if (
      !isElevated(actor) &&
      input.assignedToUserId &&
      input.assignedToUserId !== actor.id
    ) {
      throw ApiError.forbidden("You can only assign tasks to yourself");
    }

    const values = mapInput(input);
    if (input.status === "Completed") {
      values.completed = true;
      values.completedAt = new Date();
    }

    const [task] = await db
      .insert(todos)
      .values({ ...values, title: input.title, createdByUserId: actor.id })
      .returning();

    return task;
  },

  async update(
    actor: SessionUser,
    id: string,
    input: UpdateTaskInput,
  ): Promise<Todo> {
    const existing = await this.getById(actor, id);
    const patch = mapInput(input);

    // Keep `completed`, `status` and `completedAt` consistent.
    if (input.completed === true) {
      patch.completed = true;
      patch.status = "Completed";
      patch.completedAt = new Date();
    } else if (input.completed === false) {
      patch.completed = false;
      patch.completedAt = null;
      if (existing.status === "Completed") patch.status = "InProgress";
    } else if (patch.status === "Completed") {
      patch.completed = true;
      patch.completedAt = new Date();
    } else if (patch.status) {
      patch.completed = false;
      patch.completedAt = null;
    }

    const [task] = await db
      .update(todos)
      .set(patch)
      .where(eq(todos.id, id))
      .returning();

    return task;
  },

  async remove(actor: SessionUser, id: string): Promise<void> {
    const existing = await this.getById(actor, id);
    assertCanDelete(actor, existing);
    await db
      .update(todos)
      .set({ deletedAt: new Date() })
      .where(eq(todos.id, id));
  },

  async stats(actor: SessionUser): Promise<TaskStats> {
    const visibility = visibilityCondition(actor, "all");
    const base = visibility
      ? and(isNull(todos.deletedAt), visibility)
      : isNull(todos.deletedAt);

    const [statusRows, overdueRows] = await Promise.all([
      db
        .select({ status: todos.status, value: count() })
        .from(todos)
        .where(base)
        .groupBy(todos.status),
      db
        .select({ value: count() })
        .from(todos)
        .where(
          and(
            base,
            lt(todos.dueDate, new Date()),
            ne(todos.status, "Completed"),
            ne(todos.status, "Archived"),
          ),
        ),
    ]);

    const byStatus: Record<TodoStatus, number> = {
      Pending: 0,
      InProgress: 0,
      Completed: 0,
      Archived: 0,
    };
    let total = 0;
    for (const row of statusRows) {
      byStatus[row.status] = Number(row.value);
      total += Number(row.value);
    }

    return {
      total,
      byStatus,
      overdue: Number(overdueRows[0]?.value ?? 0),
    };
  },
};
