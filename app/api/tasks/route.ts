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
          remindAt:
            typeof t.remindAt === "string" && /^\d{1,2}:\d{2}$/.test(t.remindAt)
              ? (t.remindAt as string)
              : undefined,
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

    if (
      action === "update" &&
      typeof body.id === "string" &&
      body.patch &&
      typeof body.patch === "object"
    ) {
      const patch = body.patch as Record<string, unknown>;
      const next = tasks.map((t) => {
        if (t.id !== body.id) return t;
        const u: Task = { ...t };
        if ("assignee" in patch) {
          u.assignee = ["Mom", "Dad", "Kid"].includes(patch.assignee as string)
            ? (patch.assignee as Assignee)
            : "";
        }
        if (
          "priority" in patch &&
          ["high", "medium", "low"].includes(patch.priority as string)
        ) {
          u.priority = patch.priority as Task["priority"];
        }
        if (
          "title" in patch &&
          typeof patch.title === "string" &&
          patch.title.trim()
        ) {
          u.title = (patch.title as string).trim();
        }
        if ("remindAt" in patch) {
          u.remindAt =
            typeof patch.remindAt === "string" && /^\d{1,2}:\d{2}$/.test(patch.remindAt)
              ? (patch.remindAt as string)
              : undefined;
        }
        return u;
      });
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
