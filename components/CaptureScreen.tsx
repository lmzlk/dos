"use client";

import { useEffect, useRef, useState } from "react";
import { MicIcon } from "./icons";
import type { Task } from "@/lib/types";

type NewTask = Partial<Task> & { title: string };

// Minimal typing for the Web Speech API (not in TS lib DOM by default).
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function CaptureScreen({
  onCapture,
}: {
  onCapture: (tasks: NewTask[]) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const baseRef = useRef("");

  const canSave = text.trim().length > 0 && !loading;

  useEffect(() => {
    setSpeechSupported(getRecognition() !== null);
    return () => recRef.current?.stop();
  }, []);

  const defaultHint = speechSupported
    ? "Dump everything — the AI will sort it into tasks."
    : "Tip: tap the 🎤 on your keyboard to dictate.";

  async function handleSave() {
    const raw = text.trim();
    if (!raw || loading) return;
    recRef.current?.stop();
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

  function handleMic() {
    if (loading) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = getRecognition();
    if (!rec) {
      // iOS Safari & co: no in-page recognition — open keyboard, use its mic.
      textareaRef.current?.focus();
      setHint("Now tap the 🎤 on your keyboard and start talking.");
      return;
    }
    baseRef.current = text ? text.trimEnd() + " " : "";
    rec.lang = navigator.language || "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setText(baseRef.current + transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setHint("");
    setListening(true);
    rec.start();
  }

  return (
    <div className="screen">
      <div className="capture">
        <div className="capture__brand">
          do<sup>s</sup>
        </div>

        <textarea
          ref={textareaRef}
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
            className={`capture__mic${listening ? " capture__mic--on" : ""}`}
            onClick={handleMic}
            aria-label="Voice input"
            aria-pressed={listening}
            disabled={loading}
          >
            <MicIcon />
          </button>
        </div>

        <p className="capture__hint">
          {hint ||
            (listening
              ? "Listening… speak now"
              : "Dump everything — the AI will sort it into tasks.")}
        </p>
      </div>
    </div>
  );
}
