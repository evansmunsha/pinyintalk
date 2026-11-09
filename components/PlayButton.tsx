"use client";

import { useMeiVoice } from "@/lib/useMeiVoice";

// Plays with Mei's Gemini voice (cached after the first play); falls back to the phone's Mandarin voice.
export function PlayButton({ text, label = "Play" }: { text: string; label?: string }) {
  const { play, speaking } = useMeiVoice();
  return (
    <button
      type="button"
      onClick={() => play([{ text, lang: "zh" }])}
      aria-label={label}
      className={`flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-white active:bg-teal-700 ${speaking ? "animate-pulse bg-teal-500" : "bg-teal-600"}`}
    >
      ▶
    </button>
  );
}
