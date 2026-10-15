import type { TaskPriority, TaskStatus } from "@/lib/types";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  Pending: "Pending",
  InProgress: "In progress",
  Completed: "Completed",
  Archived: "Archived",
};

export const STATUS_STYLES: Record<TaskStatus, string> = {
  Pending:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900",
  InProgress:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900",
  Completed:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900",
  Archived:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
};

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  High: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900",
  Medium:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-900",
  Low: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-900",
};
