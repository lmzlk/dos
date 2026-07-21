"use client";

import type { Task, TaskPatch } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { EmptyState } from "./EmptyState";

function minutesUntil(hhmm?: string): number | null {
  if (!hhmm) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const t = new Date();
  t.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return (t.getTime() - Date.now()) / 60000;
}

// Sort: timed tasks first (by time), then untimed. Done tasks sink.
function sortForToday(a: Task, b: Task): number {
  if ((a.status === "done") !== (b.status === "done")) {
    return a.status === "done" ? 1 : -1;
  }
  const am = minutesUntil(a.remindAt);
  const bm = minutesUntil(b.remindAt);
  if (am === null && bm === null) return 0;
  if (am === null) return 1;
  if (bm === null) return -1;
  return am - bm;
}

export function TodayScreen({
  tasks,
  onToggle,
  onUpdate,
  onRemove,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onRemove: (id: string) => void;
}) {
  const remaining = tasks.filter((t) => t.status === "todo").length;

  // In-app reminders: tasks with a time that's now/overdue and not done.
  const dueNow = tasks.filter((t) => {
    if (t.status === "done") return false;
    const mins = minutesUntil(t.remindAt);
    return mins !== null && mins <= 60;
  }).length;

  const sorted = [...tasks].sort(sortForToday);

  return (
    <div className="screen">
      <header className="screen__header">
        <h1 className="screen__title">Today</h1>
        <p className="screen__subtitle">
          {tasks.length === 0
            ? "Your plan for today"
            : `${remaining} left of ${tasks.length}`}
        </p>
      </header>

      {dueNow > 0 && (
        <div className="banner">
          ⏰ {dueNow} {dueNow === 1 ? "task is" : "tasks are"} due now
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="Nothing planned yet"
          text="Capture your day and tasks with a time will line up here."
        />
      ) : (
        <div className="list">
          {sorted.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
