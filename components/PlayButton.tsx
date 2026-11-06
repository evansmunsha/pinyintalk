"use client";

import { useSpeech } from "@/lib/useSpeech";

export function PlayButton({ text, label = "Play" }: { text: string; label?: string }) {
  const { speak } = useSpeech();
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      aria-label={label}
      className="flex h-11 min-w-11 items-center justify-center rounded-full bg-teal-600 px-3 text-white active:bg-teal-700"
    >
      ▶
    </button>
  );
}
