"use client";

import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { TaskDTO } from "@/lib/types";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { PRIORITY_STYLES, STATUS_LABELS, STATUS_STYLES } from "./task-meta";

interface TaskCardProps {
  task: TaskDTO;
  assigneeName?: string;
  busy?: boolean;
  onToggleComplete: (task: TaskDTO, completed: boolean) => void;
  onEdit: (task: TaskDTO) => void;
  onDelete: (task: TaskDTO) => void;
}

export function TaskCard({
  task,
  assigneeName,
  busy,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const overdue =
    isOverdue(task.dueDate) &&
    task.status !== "Completed" &&
    task.status !== "Archived";

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="flex-row items-start gap-3 space-y-0">
        <Checkbox
          className="mt-1"
          checked={task.completed}
          disabled={busy}
          onCheckedChange={(checked) => onToggleComplete(task, checked === true)}
          aria-label="Toggle completed"
        />
        <div className="flex-1 space-y-1">
          <CardTitle
            className={cn(
              "text-base leading-snug",
              task.completed && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </CardTitle>
          {task.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-0.5">
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
          >
            <Pencil />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(task)}
            aria-label="Delete task"
          >
            <Trash2 />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="mt-auto space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={STATUS_STYLES[task.status]}>
            {STATUS_LABELS[task.status]}
          </Badge>
          <Badge variant="outline" className={PRIORITY_STYLES[task.priority]}>
            {task.priority}
          </Badge>
          {task.category && <Badge variant="secondary">{task.category}</Badge>}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {task.dueDate ? (
            <span
              className={cn(
                "flex items-center gap-1",
                overdue && "font-medium text-destructive",
              )}
            >
              <CalendarDays className="size-3.5" />
              {formatDate(task.dueDate)}
              {overdue && " · Overdue"}
            </span>
          ) : (
            <span className="text-muted-foreground/60">No due date</span>
          )}
          {assigneeName ? (
            <span>@{assigneeName}</span>
          ) : (
            <span className="italic text-muted-foreground/60">Unassigned</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
