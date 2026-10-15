import {
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
  uuid,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { basedcols } from "./columns.helpers";

/**
 * ---------------------------------------------------------------------------
 * Enums
 * ---------------------------------------------------------------------------
 * NOTE: the reference schema used `pgEnum('status', ...)` for the todo status,
 * which collides with PostgreSQL's generic `status` naming and is not scoped to
 * the feature. Renamed to `todo_status` / TS symbol `todoStatus`.
 */
export const todoStatus = pgEnum("todo_status", [
  "Pending",
  "InProgress",
  "Completed",
  "Archived",
]);

export const todoPriority = pgEnum("todo_priority", ["High", "Medium", "Low"]);

export const userRole = pgEnum("user_role", ["admin", "manager", "user", "guest"]);

/**
 * ---------------------------------------------------------------------------
 * Users
 * ---------------------------------------------------------------------------
 * The reference schema declared `role` as plain varchar even though a role enum
 * existed. Here we use the enum so the database enforces valid roles.
 */
export const users = pgTable(
  "users",
  {
    ...basedcols,
    username: varchar("username", { length: 50 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    role: userRole("role").default("user").notNull(),
    profilePicture: varchar("profile_picture", { length: 2048 }),
    bio: text("bio"),
  },
  (table) => [
    // Case-insensitive uniqueness for usernames + emails.
    uniqueIndex("users_email_unique_idx").on(sql`lower(${table.email})`),
    uniqueIndex("users_username_unique_idx").on(sql`lower(${table.username})`),
  ],
);

/**
 * ---------------------------------------------------------------------------
 * Todos / Tasks
 * ---------------------------------------------------------------------------
 * Relationship fix vs. reference schema:
 *  - `assigned_to_user_id` / `created_by_user_id` were `varchar(32)` while
 *    `users.id` was a `serial`. Types must match, so both now use the shared
 *    `uuid` base column with explicit `onDelete` behaviour.
 *  - Added indexes on the columns we filter by (status / assignee / creator).
 */
export const todos = pgTable(
  "todos",
  {
    ...basedcols,

    // Required
    title: varchar("title", { length: 255 }).notNull(),

    // Optional
    description: text("description"),

    // Status management
    status: todoStatus("status").default("Pending").notNull(),
    completed: boolean("completed").default(false).notNull(),

    // Dates
    dueDate: timestamp("due_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    // Priority
    priority: todoPriority("priority").default("Low").notNull(),

    // Relationships (a task may be unassigned, but always has a creator)
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Category / tag
    category: varchar("category", { length: 50 }),

    // Metadata
    attachmentUrl: varchar("attachment_url", { length: 2048 }),
  },
  (table) => [
    index("todos_status_idx").on(table.status),
    index("todos_priority_idx").on(table.priority),
    index("todos_assigned_to_idx").on(table.assignedToUserId),
    index("todos_created_by_idx").on(table.createdByUserId),
    index("todos_due_date_idx").on(table.dueDate),
  ],
);

/**
 * ---------------------------------------------------------------------------
 * Relations
 * ---------------------------------------------------------------------------
 * A relation name is REQUIRED here because `todos` has two foreign keys to
 * `users`; without it Drizzle cannot tell the relations apart.
 */
export const userRelations = relations(users, ({ many }) => ({
  createdTodos: many(todos, { relationName: "todos_created_by" }),
  assignedTodos: many(todos, { relationName: "todos_assigned_to" }),
}));

export const todoRelations = relations(todos, ({ one }) => ({
  assignedTo: one(users, {
    fields: [todos.assignedToUserId],
    references: [users.id],
    relationName: "todos_assigned_to",
  }),
  createdBy: one(users, {
    fields: [todos.createdByUserId],
    references: [users.id],
    relationName: "todos_created_by",
  }),
}));

// Type inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type TodoStatus = (typeof todoStatus.enumValues)[number];
export type TodoPriority = (typeof todoPriority.enumValues)[number];
export type UserRole = (typeof userRole.enumValues)[number];
