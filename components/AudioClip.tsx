"use client";

import { useEffect, useRef, useState } from "react";
import { Bi } from "@/components/Bi";
import type { Label } from "@/lib/ui-text";

// Only one clip plays at a time.
let current: HTMLAudioElement | null = null;

// Plays a saved audio file (never calls Gemini) with a progress bar.
export function AudioClip({ src, label, dark = false }: { src: string | null; label: Label; dark?: boolean }) {
  const el = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    return () => {
      el.current?.pause();
      if (current === el.current) current = null;
    };
  }, []);

  function toggle() {
    if (!src) return;
    if (!el.current) {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.onplay = () => setPlaying(true);
      audio.onpause = () => setPlaying(false);
      audio.onended = () => {
        setPlaying(false);
        setProgress(0);
      };
      audio.ontimeupdate = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
      audio.onerror = () => setFailed(true);
      el.current = audio;
    }
    if (el.current.paused) {
      if (current && current !== el.current) current.pause();
      current = el.current;
      el.current.play().catch(() => setFailed(true));
    } else {
      el.current.pause();
    }
  }

  const base = dark ? "border-white/40 bg-white/15 text-white" : "border-stone-300 bg-white text-stone-800";
  const track = dark ? "bg-white/30" : "bg-stone-200";
  const bar = dark ? "bg-white" : "bg-teal-600";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!src || failed}
      aria-pressed={playing}
      className={`flex min-h-11 w-full flex-col justify-center gap-1 rounded-xl border px-3 py-1.5 text-left disabled:opacity-50 ${base}`}
    >
      <span className="flex items-center gap-2">
        <span aria-hidden>{playing ? "⏸" : "▶"}</span>
        <Bi label={label} align="start" />
      </span>
      <span className={`block h-1.5 w-full overflow-hidden rounded-full ${track}`} aria-hidden>
        <span className={`block h-full rounded-full ${bar}`} style={{ width: `${Math.round(progress * 100)}%` }} />
      </span>
    </button>
  );
}
