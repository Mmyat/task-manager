"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
  type UserDTO,
} from "@/lib/types";

export interface TaskFilterState {
  search: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  assignedToUserId: string | "all";
  scope: "all" | "assigned" | "created";
  sort: "createdAt" | "dueDate" | "priority" | "title";
  order: "asc" | "desc";
}

export const DEFAULT_FILTERS: TaskFilterState = {
  search: "",
  status: "all",
  priority: "all",
  assignedToUserId: "all",
  scope: "all",
  sort: "createdAt",
  order: "desc",
};

interface TaskFiltersProps {
  filters: TaskFilterState;
  users: UserDTO[];
  onChange: (filters: TaskFilterState) => void;
}

export function TaskFiltersBar({ filters, users, onChange }: TaskFiltersProps) {
  const update = <K extends keyof TaskFilterState>(
    key: K,
    value: TaskFilterState[K],
  ) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => update("search", event.target.value)}
          placeholder="Search tasks…"
          className="pl-8"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => update("status", value as TaskStatus | "all")}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {TASK_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(value) =>
          update("priority", value as TaskPriority | "all")
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {TASK_PRIORITIES.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {priority}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.assignedToUserId}
        onValueChange={(value) => update("assignedToUserId", value)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Everyone</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.scope}
        onValueChange={(value) =>
          update("scope", value as TaskFilterState["scope"])
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Scope" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tasks</SelectItem>
          <SelectItem value="assigned">Assigned to me</SelectItem>
          <SelectItem value="created">Created by me</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={`${filters.sort}:${filters.order}`}
        onValueChange={(value) => {
          const [sort, order] = value.split(":") as [
            TaskFilterState["sort"],
            TaskFilterState["order"],
          ];
          onChange({ ...filters, sort, order });
        }}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt:desc">Newest first</SelectItem>
          <SelectItem value="createdAt:asc">Oldest first</SelectItem>
          <SelectItem value="dueDate:asc">Due soonest</SelectItem>
          <SelectItem value="priority:asc">Priority</SelectItem>
          <SelectItem value="title:asc">Title A–Z</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="icon"
        title="Reset filters"
        onClick={() => onChange({ ...DEFAULT_FILTERS })}
      >
        <X />
      </Button>
    </div>
  );
}
