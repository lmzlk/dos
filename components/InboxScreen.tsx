"use client";

import type { Task, TaskPatch } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { EmptyState } from "./EmptyState";

export function InboxScreen({
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
        <h1 className="screen__title">Inbox</h1>
        <p className="screen__subtitle">Tap a task to set who, time & more</p>
      </header>

      {tasks.length === 0 ? (
        <EmptyState
          emoji="📥"
          title="Inbox zero"
          text="Capture something on the first tab and the AI will drop tasks here."
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
