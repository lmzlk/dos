"use client";

import { useState } from "react";
import { MicIcon } from "./icons";
import type { Task } from "@/lib/types";

export function CaptureScreen({
  onCapture,
}: {
  onCapture: (partial: Partial<Task> & { title: string }) => void;
}) {
  const [text, setText] = useState("");

  const canSave = text.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    // For now we just drop the raw text into the inbox as a single task.
    // Later the AI layer will split this into structured tasks.
    onCapture({ title: text.trim() });
    setText("");
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
        />

        <div className="capture__actions">
          <button
            className="capture__save"
            onClick={handleSave}
            disabled={!canSave}
          >
            Add to inbox
          </button>
          <button
            className="capture__mic"
            aria-label="Voice input (coming soon)"
            title="Voice input — coming soon"
          >
            <MicIcon />
          </button>
        </div>

        <p className="capture__hint">
          Dump everything — the AI will sort it into tasks later.
        </p>
      </div>
    </div>
  );
}
