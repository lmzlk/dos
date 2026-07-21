"use client";

import { useState } from "react";
import { SparkleIcon, MicIcon } from "./icons";
import type { Task } from "@/lib/types";

type NewTask = Partial<Task> & { title: string };

export function CaptureScreen({
  onCapture,
}: {
  onCapture: (tasks: NewTask[]) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");
  const [copied, setCopied] = useState(false);

  const canSave = text.trim().length > 0 && !loading;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function handleSave() {
    const raw = text.trim();
    if (!raw || loading) return;
    setLoading(true);
    setHint("");
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
          : [{ title: raw }];
      onCapture(tasks);
      setText("");
    } catch {
      onCapture([{ title: raw }]);
      setText("");
      setHint("Saved without AI (network issue).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <div className="capture">
        <div>
          <div className="capture__brand">
            do<sup>s</sup>
          </div>
          <div className="capture__tagline">
            The whole family, on the same page.
          </div>
          <button
            type="button"
            className="capture__invite"
            onClick={copyLink}
          >
            {copied ? "Link copied" : "Invite family — copy link"}
          </button>
        </div>

        <textarea
          className="capture__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="book a dentist appointment"
          autoFocus
          disabled={loading}
        />

        <div className="capture__voice">
          <span className="capture__voice-icon">
            <MicIcon />
          </span>
          <span>
            <span className="capture__voice-lead">Prefer voice?</span> Dictate
            with your keyboard mic
          </span>
        </div>

        <button
          className="capture__save"
          onClick={handleSave}
          disabled={!canSave}
        >
          {loading ? (
            "Thinking…"
          ) : (
            <>
              <SparkleIcon /> Add to inbox
            </>
          )}
        </button>

        <p className="capture__hint">
          {hint || "AI sorts it into tasks — sets priority, time, deadline & who."}
        </p>
      </div>
    </div>
  );
}
