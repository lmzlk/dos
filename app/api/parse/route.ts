import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ParsedTask = {
  title: string;
  priority: "high" | "medium" | "low";
  estimate: number | null;
  due: string | null;
  remindAt: string | null;
  assignee: "Mom" | "Dad" | "Kid" | "";
};

// Server-side task parser. The Anthropic API key lives ONLY here
// (Vercel env var ANTHROPIC_API_KEY) and never reaches the browser.
export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ANTHROPIC_API_KEY" },
      { status: 500 },
    );
  }

  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!text.trim()) {
    return NextResponse.json({ tasks: [] });
  }

  const today = new Date().toISOString().slice(0, 10);

  const system = `You are the task parser for "dos", a family day planner.
Turn the user's brain dump into a clean list of concrete tasks.
Today's date is ${today}.

Return ONLY a JSON array (no prose, no markdown fences) where each item has:
- "title": short actionable task text (string)
- "priority": "high" | "medium" | "low"
- "estimate": estimated minutes as a number, or null
- "due": deadline date as "YYYY-MM-DD", or null
- "remindAt": time of day as "HH:MM" (24h) if a time is mentioned, or null
- "assignee": one of "Mom", "Dad", "Kid", or "" if unclear

Rules:
- Split multiple tasks; merge obvious duplicates.
- Infer priority and assignee from context; if unclear use "medium" and "".
- Map who is responsible to assignee, in any language:
  "мама"/"mom"/"mum" -> "Mom"; "тато"/"батько"/"dad" -> "Dad";
  "дитина"/"син"/"дочка"/"kid"/"child" -> "Kid".
  When a word only marks the responsible person, set "assignee" and REMOVE that word from the title.
- Resolve relative dates (e.g. "tomorrow"/"завтра") against today's date.
- Keep titles concise and in the same language the user wrote.
Return [] if there are no real tasks.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: text }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "AI request failed", detail },
        { status: 502 },
      );
    }

    const data = await res.json();
    const raw: string = data?.content?.[0]?.text ?? "";
    return NextResponse.json({ tasks: extractTasks(raw) });
  } catch (e) {
    return NextResponse.json(
      { error: "AI request error", detail: String(e) },
      { status: 502 },
    );
  }
}

// The model should return clean JSON, but never trust it blindly:
// strip any fences and pull out the first [...] block, then validate.
function extractTasks(raw: string): ParsedTask[] {
  if (!raw) return [];
  let s = raw.trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }
  try {
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (t: unknown): t is Record<string, unknown> =>
          !!t && typeof (t as Record<string, unknown>).title === "string",
      )
      .map((t) => {
        const title = String(t.title).trim();
        const priority = ["high", "medium", "low"].includes(t.priority as string)
          ? (t.priority as ParsedTask["priority"])
          : "medium";
        const estimate =
          typeof t.estimate === "number" && t.estimate > 0
            ? Math.round(t.estimate)
            : null;
        const due =
          typeof t.due === "string" && /^\d{4}-\d{2}-\d{2}/.test(t.due)
            ? t.due
            : null;
        const remindAt =
          typeof t.remindAt === "string" && /^\d{1,2}:\d{2}$/.test(t.remindAt)
            ? t.remindAt
            : null;
        const assignee = ["Mom", "Dad", "Kid"].includes(t.assignee as string)
          ? (t.assignee as ParsedTask["assignee"])
          : "";
        return { title, priority, estimate, due, remindAt, assignee };
      })
      .filter((t) => t.title.length > 0);
  } catch {
    return [];
  }
}
