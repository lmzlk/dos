"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task } from "./types";

const STORAGE_KEY = "dos.tasks.v1";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

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
 * Client-side task store backed by localStorage. No backend yet —
 * this is the seam where the AI parsing + sync layer will plug in later.
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount (avoids SSR/localStorage mismatch).
  useEffect(() => {
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  // Persist on every change once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
  }, [tasks, hydrated]);

  const addTask = useCallback((partial: Partial<Task> & { title: string }) => {
    const task: Task = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now()) + Math.random().toString(16).slice(2),
      title: partial.title,
      priority: partial.priority ?? "medium",
      estimate: partial.estimate,
      due: partial.due,
      assignee: partial.assignee ?? "",
      status: partial.status ?? "todo",
      createdAt: partial.createdAt ?? new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "todo" : "done" }
          : t,
      ),
    );
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const todayTasks = tasks.filter((t) => isToday(t.due) || isToday(t.createdAt));

  return { tasks, todayTasks, hydrated, addTask, toggleTask, removeTask };
}
