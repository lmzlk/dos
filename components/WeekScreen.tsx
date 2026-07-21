"use client";

import type { Task, TaskPatch } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { EmptyState } from "./EmptyState";

// Whole-day difference between a due date and today (local).
export function daysUntil(due?: string): number | null {
  if (!due) return null;
  const d = new Date(due);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export function WeekScreen({
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
  const sorted = [...tasks].sort(
    (a, b) => (daysUntil(a.due) ?? 99) - (daysUntil(b.due) ?? 99),
  );

  return (
    <div className="screen">
      <header className="screen__header">
        <h1 className="screen__title">Next 7 days</h1>
        <p className="screen__subtitle">
          {tasks.length === 0
            ? "What's coming up this week"
            : `${tasks.length} upcoming`}
        </p>
      </header>

      {tasks.length === 0 ? (
        <EmptyState
          emoji="📅"
          title="Nothing coming up"
          text="Tasks with a deadline in the next 7 days will show here."
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
