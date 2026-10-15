"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiClientError, api } from "@/lib/api-client";
import type { TaskDTO, TaskStatsDTO, UserDTO } from "@/lib/types";
import { TaskCard } from "./task-card";
import { TaskFormDialog } from "./task-form-dialog";
import {
  DEFAULT_FILTERS,
  TaskFiltersBar,
  type TaskFilterState,
} from "./task-filters";
import { TaskStats } from "./task-stats";

interface TaskDashboardProps {
  currentUser: { id: string; username: string; email: string; role: string };
}

export function TaskDashboard({ currentUser }: TaskDashboardProps) {
  const router = useRouter();

  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [stats, setStats] = useState<TaskStatsDTO | null>(null);
  const [filters, setFilters] = useState<TaskFilterState>({ ...DEFAULT_FILTERS });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TaskDTO | null>(null);
  const [dialogKey, setDialogKey] = useState(0);

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      if (err instanceof ApiClientError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : fallback);
    },
    [router],
  );

  const loadTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.priority !== "all") params.set("priority", filters.priority);
    if (filters.assignedToUserId !== "all") {
      params.set("assignedToUserId", filters.assignedToUserId);
    }
    if (filters.scope !== "all") params.set("scope", filters.scope);
    params.set("sort", filters.sort);
    params.set("order", filters.order);

    const data = await api.get<TaskDTO[]>(`/api/tasks?${params.toString()}`);
    setTasks(data);
  }, [
    debouncedSearch,
    filters.status,
    filters.priority,
    filters.assignedToUserId,
    filters.scope,
    filters.sort,
    filters.order,
  ]);

  const loadStats = useCallback(async () => {
    const data = await api.get<TaskStatsDTO>("/api/tasks/stats");
    setStats(data);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadTasks(), loadStats()]);
  }, [loadTasks, loadStats]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timeout);
  }, [filters.search]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        await refresh();
      } catch (err) {
        if (active) handleError(err, "Failed to load tasks");
      } finally {
        if (active) setLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [refresh, handleError]);

  useEffect(() => {
    api
      .get<UserDTO[]>("/api/users")
      .then(setUsers)
      .catch(() => {
        /* non-critical */
      });
  }, []);

  const userMap = useMemo(
    () => new Map(users.map((user) => [user.id, user.username])),
    [users],
  );

  async function toggleComplete(task: TaskDTO, completed: boolean) {
    setBusyId(task.id);
    setError(null);
    try {
      await api.patch(`/api/tasks/${task.id}`, { completed });
      await refresh();
    } catch (err) {
      handleError(err, "Failed to update the task");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteTask(task: TaskDTO) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setBusyId(task.id);
    setError(null);
    try {
      await api.delete(`/api/tasks/${task.id}`);
      await refresh();
    } catch (err) {
      handleError(err, "Failed to delete the task");
    } finally {
      setBusyId(null);
    }
  }

  function openCreate() {
    setEditing(null);
    setDialogKey((key) => key + 1);
    setDialogOpen(true);
  }

  function openEdit(task: TaskDTO) {
    setEditing(task);
    setDialogKey((key) => key + 1);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your tasks</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {currentUser.username}. Here is what&apos;s on your
            plate.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          New task
        </Button>
      </div>

      <TaskStats stats={stats} />

      <TaskFiltersBar filters={filters} users={users} onChange={setFilters} />

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-lg font-medium">No tasks found</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {filters.search || filters.status !== "all"
                ? "Try adjusting your filters or search terms."
                : "Create your first task to get started."}
            </p>
            <Button onClick={openCreate}>
              <Plus />
              New task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assigneeName={
                task.assignedToUserId
                  ? userMap.get(task.assignedToUserId)
                  : undefined
              }
              busy={busyId === task.id}
              onToggleComplete={toggleComplete}
              onEdit={openEdit}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}

      <TaskFormDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        users={users}
        currentUser={currentUser}
        onSaved={refresh}
      />
    </div>
  );
}
