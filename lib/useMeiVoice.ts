"use client";

import { useCallback, useRef, useState } from "react";

export type Part = { text: string; lang: "zh" | "en"; speechText?: string };

// Plays Mei's voice from /api/voice/speak. Falls back to the browser voice (zh-CN) if Gemini fails.
export function useMeiVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [error, setError] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const run = useRef(0);

  const playOne = useCallback(async (part: Part, slow: boolean, id: number) => {
    const text = part.lang === "zh" ? part.speechText || part.text : part.text;
    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang: part.lang, slow }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Voice failed");
      const url = URL.createObjectURL(await res.blob());
      await new Promise<void>((resolve, reject) => {
        if (id !== run.current) return resolve();
        const el = new Audio(url);
        audio.current = el;
        el.onended = () => resolve();
        el.onerror = () => reject(new Error("Could not play audio"));
        el.play().catch(reject);
      });
      URL.revokeObjectURL(url);
    } catch (e) {
      if (id !== run.current) return;
      setError(e instanceof Error ? e.message : "Voice failed");
      setFallbackUsed(true);
      if ("speechSynthesis" in window) {
        await new Promise<void>((resolve) => {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = part.lang === "zh" ? "zh-CN" : "en-US";
          u.rate = slow ? 0.6 : 0.95;
          u.onend = () => resolve();
          u.onerror = () => resolve();
          window.speechSynthesis.speak(u);
        });
      }
    }
  }, []);

  // Plays parts in order with a short pause between them.
  const play = useCallback(
    async (parts: Part[], slow = false) => {
      const id = ++run.current;
      audio.current?.pause();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setError("");
      setSpeaking(true);
      for (let i = 0; i < parts.length; i++) {
        if (id !== run.current) return;
        await playOne(parts[i], slow, id);
        if (i < parts.length - 1) await new Promise((r) => setTimeout(r, 500));
      }
      if (id === run.current) setSpeaking(false);
    },
    [playOne]
  );

  return { play, speaking, fallbackUsed, error };
}
