"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError, api } from "@/lib/api-client";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskDTO,
  type TaskPriority,
  type TaskStatus,
  type UserDTO,
} from "@/lib/types";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskDTO | null;
  users: UserDTO[];
  currentUser: { id: string; role: string };
  onSaved: () => void | Promise<void>;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedToUserId: string;
  category: string;
  attachmentUrl: string;
}

const UNASSIGNED = "unassigned";

function toFormState(task: TaskDTO | null): FormState {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "Pending",
    priority: task?.priority ?? "Low",
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
    assignedToUserId: task?.assignedToUserId ?? UNASSIGNED,
    category: task?.category ?? "",
    attachmentUrl: task?.attachmentUrl ?? "",
  };
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  users,
  currentUser,
  onSaved,
}: TaskFormDialogProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(task));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(task);
  const canAssignOthers =
    currentUser.role === "admin" || currentUser.role === "manager";
  const assignableUsers = canAssignOthers
    ? users
    : users.filter((user) => user.id === currentUser.id);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      assignedToUserId:
        form.assignedToUserId === UNASSIGNED ? null : form.assignedToUserId,
      category: form.category.trim() || null,
      attachmentUrl: form.attachmentUrl.trim() || null,
    };

    try {
      if (isEdit && task) {
        await api.patch(`/api/tasks/${task.id}`, payload);
      } else {
        await api.post("/api/tasks", payload);
      }
      await onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Failed to save the task",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this task."
              : "Add a new task to your board."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="e.g. Write project documentation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Add more detail…"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => set("status", value as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) => set("priority", value as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(event) => set("dueDate", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={form.assignedToUserId}
                onValueChange={(value) => set("assignedToUserId", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {assignableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(event) => set("category", event.target.value)}
                placeholder="e.g. Work"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachmentUrl">Attachment URL</Label>
              <Input
                id="attachmentUrl"
                value={form.attachmentUrl}
                onChange={(event) => set("attachmentUrl", event.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
