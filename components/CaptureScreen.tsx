"use client";

import { useState } from "react";
import { MicIcon } from "./icons";
import type { Task } from "@/lib/types";

type NewTask = Partial<Task> & { title: string };

export function CaptureScreen({
  onCapture,
}: {
  onCapture: (tasks: NewTask[]) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSave = text.trim().length > 0 && !loading;

  async function handleSave() {
    const raw = text.trim();
    if (!raw || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: raw }),
      });
      const data = await res.json();
      const tasks: NewTask[] =
        res.ok && Array.isArray(data.tasks) && data.tasks.length > 0
          ? data.tasks
          : [{ title: raw }]; // fallback: keep the raw dump as one task
      onCapture(tasks);
      setText("");
    } catch {
      onCapture([{ title: raw }]);
      setText("");
      setError("Saved without AI (network issue).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <div className="capture">
        <div className="capture__brand">
          do<sup>s</sup>
        </div>

        <textarea
          className="capture__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          autoFocus
          disabled={loading}
        />

        <div className="capture__actions">
          <button
            className="capture__save"
            onClick={handleSave}
            disabled={!canSave}
          >
            {loading ? "Thinking…" : "Add to inbox"}
          </button>
          <button
            className="capture__mic"
            aria-label="Voice input — tap the mic on your keyboard"
            title="Voice input — tap the mic on your keyboard"
            disabled={loading}
          >
            <MicIcon />
          </button>
        </div>

        <p className="capture__hint">
          {error || "Dump everything — the AI will sort it into tasks."}
        </p>
      </div>
    </div>
  );
}
