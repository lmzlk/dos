"use client";

import type { Task } from "@/lib/types";
import { CheckIcon } from "./icons";

export function TaskItem({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (id: string) => void;
}) {
  const done = task.status === "done";

  return (
    <div className="task">
      <button
        className={`task__check${done ? " task__check--done" : ""}`}
        onClick={() => onToggle(task.id)}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        aria-pressed={done}
      >
        {done && <CheckIcon />}
      </button>

      <div className="task__body">
        <div className={`task__title${done ? " task__title--done" : ""}`}>
          {task.title}
        </div>
        <div className="task__meta">
          {task.assignee && (
            <span className="chip chip--assignee">{task.assignee}</span>
          )}
          <span className={`chip chip--${task.priority}`}>{task.priority}</span>
          {typeof task.estimate === "number" && (
            <span className="chip">{task.estimate}m</span>
          )}
        </div>
      </div>
    </div>
  );
}
