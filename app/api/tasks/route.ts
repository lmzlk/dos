import { NextResponse } from "next/server";
import Redis from "ioredis";
import type { Task, Assignee } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One shared family list lives under this key. Everyone who opens the
// public link reads and writes the same list — no accounts needed.
const KEY = "dos:tasks:v1";

// Reuse the connection across warm invocations.
let client: Redis | null = null;
function redis(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL as string, {
      maxRetriesPerRequest: 3,
    });
  }
  return client;
}

async function readTasks(): Promise<Task[]> {
  const raw = await redis().get(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Task[]) : [];
  } catch {
    return [];
  }
}

async function writeTasks(tasks: Task[]): Promise<void> {
  await redis().set(KEY, JSON.stringify(tasks));
}

function newId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    String(Date.now()) + Math.random().toString(16).slice(2)
  );
}

export async function GET() {
  try {
    return NextResponse.json({ tasks: await readTasks() });
  } catch (e) {
    return NextResponse.json({ tasks: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const action = body.action;

  try {
    const tasks = await readTasks();

    if (action === "add" && Array.isArray(body.tasks)) {
      const now = new Date().toISOString();
      const toAdd: Task[] = (body.tasks as Array<Record<string, unknown>>)
        .filter((t) => t && typeof t.title === "string" && t.title.trim())
        .map((t) => ({
          id: newId(),
          title: String(t.title).trim(),
          priority: ["high", "medium", "low"].includes(t.priority as string)
            ? (t.priority as Task["priority"])
            : "medium",
          estimate:
            typeof t.estimate === "number" && t.estimate > 0
              ? (t.estimate as number)
              : undefined,
          due: typeof t.due === "string" && t.due ? (t.due as string) : undefined,
          assignee: ["Mom", "Dad", "Kid"].includes(t.assignee as string)
            ? (t.assignee as Assignee)
            : "",
          status: "todo",
          createdAt: now,
        }));
      const next = [...toAdd, ...tasks];
      await writeTasks(next);
      return NextResponse.json({ tasks: next });
    }

    if (action === "toggle" && typeof body.id === "string") {
      const next = tasks.map((t) =>
        t.id === body.id
          ? { ...t, status: t.status === "done" ? "todo" : "done" }
          : t,
      );
      await writeTasks(next as Task[]);
      return NextResponse.json({ tasks: next });
    }

    if (action === "assign" && typeof body.id === "string") {
      const a = ["Mom", "Dad", "Kid", ""].includes(body.assignee as string)
        ? (body.assignee as Assignee)
        : "";
      const next = tasks.map((t) =>
        t.id === body.id ? { ...t, assignee: a } : t,
      );
      await writeTasks(next);
      return NextResponse.json({ tasks: next });
    }

    if (action === "remove" && typeof body.id === "string") {
      const next = tasks.filter((t) => t.id !== body.id);
      await writeTasks(next);
      return NextResponse.json({ tasks: next });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
