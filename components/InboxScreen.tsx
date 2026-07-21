"use client";

import type { Task } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { EmptyState } from "./EmptyState";

export function InboxScreen({
  tasks,
  onToggle,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="screen">
      <header className="screen__header">
        <h1 className="screen__title">Inbox</h1>
        <p className="screen__subtitle">Parsed tasks land here</p>
      </header>

      {tasks.length === 0 ? (
        <EmptyState
          emoji="📥"
          title="Inbox zero"
          text="Capture something on the first tab and it'll show up here as a task."
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
