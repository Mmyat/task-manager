export const TASK_STATUSES = [
  "Pending",
  "InProgress",
  "Completed",
  "Archived",
] as const;

export const TASK_PRIORITIES = ["High", "Medium", "Low"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  role: string;
  profilePicture: string | null;
}

export interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  completed: boolean;
  dueDate: string | null;
  completedAt: string | null;
  priority: TaskPriority;
  assignedToUserId: string | null;
  createdByUserId: string;
  category: string | null;
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatsDTO {
  total: number;
  byStatus: Record<TaskStatus, number>;
  overdue: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
