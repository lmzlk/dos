"use client";

import type { Task } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { EmptyState } from "./EmptyState";

export function TodayScreen({
  tasks,
  onToggle,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
}) {
  const remaining = tasks.filter((t) => t.status === "todo").length;

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

      {tasks.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="Nothing planned yet"
          text="Tasks due today will appear here as a simple checklist."
        />
      ) : (
        <div className="list">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
