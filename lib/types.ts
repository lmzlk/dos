// Core task model for dos. Fields are laid out now even though the
// AI parsing layer that fills them will come later.

export type Priority = "high" | "medium" | "low";
export type Assignee = "Mom" | "Dad" | "Kid" | "";
export type Status = "todo" | "done";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  estimate?: number; // minutes, optional
  due?: string; // ISO date string, optional
  assignee: Assignee;
  status: Status;
  createdAt: string; // ISO date-time string
}

export const ASSIGNEES: Assignee[] = ["Mom", "Dad", "Kid"];
