// Core task model for dos (shared family day planner).

export type Priority = "high" | "medium" | "low";
export type Assignee = "Mom" | "Dad" | "Kid" | "";
export type Status = "todo" | "done";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  estimate?: number; // minutes, optional
  due?: string; // ISO date string, optional
  remindAt?: string; // local wall-clock "HH:MM", optional (in-app reminder)
  assignee: Assignee;
  status: Status;
  createdAt: string; // ISO date-time string
}

// A partial change applied to a task via /api/tasks (action: "update").
export interface TaskPatch {
  title?: string;
  priority?: Priority;
  assignee?: Assignee;
  remindAt?: string; // "" clears the reminder
}

export const ASSIGNEES: Exclude<Assignee, "">[] = ["Mom", "Dad", "Kid"];
