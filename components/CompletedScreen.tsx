"use client";

import type { Task, TaskPatch } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { EmptyState } from "./EmptyState";

export function CompletedScreen({
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
  return (
    <div className="screen">
      <header className="screen__header">
        <h1 className="screen__title">Done</h1>
        <p className="screen__subtitle">
          {tasks.length === 0
            ? "Completed tasks land here"
            : `${tasks.length} completed`}
        </p>
      </header>

      {tasks.length === 0 ? (
        <EmptyState
          emoji="✅"
          title="Nothing done yet"
          text="Check a task off and it moves here. Tap the box again to bring it back."
        />
      ) : (
        <div className="list">
          {tasks.map((task) => (
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
