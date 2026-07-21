"use client";

import { useState } from "react";
import type { Task, TaskPatch, Assignee } from "@/lib/types";
import { CheckIcon, ClockIcon, CalendarIcon, TrashIcon } from "./icons";

const ASSIGNEE_OPTS: Exclude<Assignee, "">[] = ["Mom", "Dad", "Kid"];

// remindAt is a local "HH:MM" — interpret it against today's local time.
function reminderState(
  hhmm: string | undefined,
  done: boolean,
): "" | "soon" | "overdue" {
  if (!hhmm || done) return "";
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return "";
  const target = new Date();
  target.setHours(Number(m[1]), Number(m[2]), 0, 0);
  const diffMin = (target.getTime() - Date.now()) / 60000;
  if (diffMin < 0) return "overdue";
  if (diffMin <= 60) return "soon";
  return "";
}

function formatDue(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const now = new Date();
  const isThisYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(isThisYear ? {} : { year: "numeric" }),
  });
}

export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onRemove,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate?: (id: string, patch: TaskPatch) => void;
  onRemove?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const done = task.status === "done";
  const editable = !!onUpdate;
  const remState = reminderState(task.remindAt, done);

  return (
    <div className={`task${remState === "overdue" ? " task--overdue" : ""}`}>
      <div className="task__row">
        <button
          className={`task__check${done ? " task__check--done" : ""}`}
          onClick={() => onToggle(task.id)}
          aria-label={done ? "Mark as not done" : "Mark as done"}
          aria-pressed={done}
        >
          {done && <CheckIcon />}
        </button>

        <button
          className="task__body"
          onClick={() => editable && setOpen((o) => !o)}
          aria-expanded={editable ? open : undefined}
        >
          <div className={`task__title${done ? " task__title--done" : ""}`}>
            {task.title}
          </div>
          <div className="task__meta">
            {task.assignee && (
              <span
                className={`chip chip--assignee chip--${task.assignee.toLowerCase()}`}
              >
                {task.assignee}
              </span>
            )}
            <span className={`chip chip--${task.priority}`}>
              {task.priority}
            </span>
            {task.remindAt && (
              <span className={`chip chip--time chip--rem-${remState}`}>
                <ClockIcon /> {task.remindAt}
              </span>
            )}
            {task.due && (
              <span className="chip chip--due">
                <CalendarIcon /> {formatDue(task.due)}
              </span>
            )}
            {typeof task.estimate === "number" && (
              <span className="chip">{task.estimate}m</span>
            )}
          </div>
        </button>
      </div>

      {open && editable && (
        <div className="task__detail">
          <div className="task__field">
            <span className="task__label">Who</span>
            <div className="task__opts">
              {ASSIGNEE_OPTS.map((a) => (
                <button
                  key={a}
                  className={`opt opt--${a.toLowerCase()}${
                    task.assignee === a ? " opt--on" : ""
                  }`}
                  onClick={() =>
                    onUpdate!(task.id, {
                      assignee: task.assignee === a ? "" : a,
                    })
                  }
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="task__field">
            <span className="task__label">Remind</span>
            <input
              className="task__time"
              type="time"
              value={task.remindAt ?? ""}
              onChange={(e) =>
                onUpdate!(task.id, { remindAt: e.target.value || "" })
              }
            />
            {task.remindAt && (
              <button
                className="task__clear"
                onClick={() => onUpdate!(task.id, { remindAt: "" })}
              >
                Clear
              </button>
            )}
          </div>

          {onRemove && (
            <button
              className="task__delete"
              onClick={() => onRemove(task.id)}
            >
              <TrashIcon /> Delete task
            </button>
          )}
        </div>
      )}
    </div>
  );
}
