"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Task, TaskPatch } from "./types";

type NewTask = Partial<Task> & { title: string };

function isToday(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Shared family task store backed by a server list (Redis via /api/tasks).
 * Everyone on the same link sees the same tasks. We poll every few seconds
 * so a change on Mom's phone shows up on Dad's soon after.
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.tasks)) setTasks(data.tasks);
    } catch {
      // keep last known list on transient errors
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(() => {
      // don't poll on top of a write in flight (avoids flicker)
      if (!busy.current) refresh();
    }, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  const send = useCallback(async (body: Record<string, unknown>) => {
    busy.current = true;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (Array.isArray(data.tasks)) setTasks(data.tasks);
    } catch {
      // ignore; next poll will reconcile
    } finally {
      busy.current = false;
    }
  }, []);

  const addTasks = useCallback(
    (items: NewTask[]) => send({ action: "add", tasks: items }),
    [send],
  );
  const toggleTask = useCallback(
    (id: string) => send({ action: "toggle", id }),
    [send],
  );
  const updateTask = useCallback(
    (id: string, patch: TaskPatch) => send({ action: "update", id, patch }),
    [send],
  );
  const removeTask = useCallback(
    (id: string) => send({ action: "remove", id }),
    [send],
  );

  // "Today" = tasks whose deadline is today, or timed-for-today tasks
  // (a reminder time set, with no future deadline). No catch-all on createdAt.
  const todayTasks = tasks.filter(
    (t) => isToday(t.due) || (!!t.remindAt && !t.due),
  );

  return {
    tasks,
    todayTasks,
    hydrated,
    addTasks,
    toggleTask,
    updateTask,
    removeTask,
    refresh,
  };
}
