"use client";

import { useCallback, useRef, useState } from "react";

// `turnId` (optional): the server also saves the normal-speed clip to that saved conversation turn.
export type Part = { text: string; lang: "zh" | "en"; speechText?: string; turnId?: string };

function speakText(part: Part) {
  return part.lang === "zh" ? part.speechText || part.text : part.text;
}

// Clips already downloaded in this browser tab, so repeats play instantly.
const clipCache = new Map<string, Promise<string>>();

// Common Mei lines, requested in the background so the first answer can play straight away.
export const COMMON_PARTS: Part[] = [
  { text: "nǐ hǎo", lang: "zh", speechText: "你好" },
  { text: "wǒ hěn hǎo, xièxie", lang: "zh", speechText: "我很好，谢谢" },
  { text: "wǒ jiào Mei", lang: "zh", speechText: "我叫Mei" },
  { text: "I said, hello.", lang: "en" },
  { text: "I said, I am very well, thank you.", lang: "en" },
  { text: "I said, my name is Mei.", lang: "en" },
];

function loadClip(part: Part, slow: boolean): Promise<string> {
  const text = part.lang === "zh" ? part.speechText || part.text : part.text;
  // Clips that must be saved to a turn skip the browser cache so the server always sees the request.
  const key = `${part.lang}|${slow}|${text}|${part.turnId ?? ""}`;
  const cached = clipCache.get(key);
  if (cached) return cached;

  const started = performance.now();
  const promise = (async () => {
    const res = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang: part.lang, slow, turnId: part.turnId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error([body.error ?? "Voice failed", body.detail].filter(Boolean).join(" — "));
    }
    const url = URL.createObjectURL(await res.blob());
    console.log(`[timing] speak ${part.lang}: ${Math.round(performance.now() - started)}ms`);
    return url;
  })();
  // Failed requests are not cached, so they can be retried.
  promise.catch(() => clipCache.delete(key));
  clipCache.set(key, promise);
  return promise;
}

export function warmUpCommonClips() {
  COMMON_PARTS.forEach((p) => loadClip(p, false).catch(() => undefined));
}

// Plays Mei's voice from /api/voice/speak. Falls back to the browser voice (zh-CN) if Gemini fails.
export function useMeiVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [error, setError] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const run = useRef(0);

  const fetchClip = useCallback((part: Part, slow: boolean) => loadClip(part, slow), []);

  const playUrl = (url: string, id: number) =>
    new Promise<void>((resolve, reject) => {
      if (id !== run.current) return resolve();
      const el = new Audio(url);
      audio.current = el;
      el.onended = () => resolve();
      el.onerror = () => reject(new Error("Could not play audio"));
      el.play().catch(reject);
    });

  const browserVoice = useCallback(
    (part: Part, slow: boolean) =>
      new Promise<void>((resolve) => {
        if (!("speechSynthesis" in window)) return resolve();
        const u = new SpeechSynthesisUtterance(speakText(part));
        u.lang = part.lang === "zh" ? "zh-CN" : "en-US";
        u.rate = slow ? 0.6 : 0.95;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      }),
    []
  );

  // Fetches every part at once, then plays them in order with a short pause between.
  const play = useCallback(
    async (parts: Part[], slow = false) => {
      const id = ++run.current;
      audio.current?.pause();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setError("");
      setSpeaking(true);
      const clips = parts.map((p) => fetchClip(p, slow));
      clips.forEach((c) => c.catch(() => undefined));
      for (let i = 0; i < parts.length; i++) {
        if (id !== run.current) return;
        try {
          await playUrl(await clips[i], id);
        } catch (e) {
          if (id !== run.current) return;
          setError(e instanceof Error ? e.message : "Voice failed");
          setFallbackUsed(true);
          await browserVoice(parts[i], slow);
        }
        if (i < parts.length - 1) await new Promise((r) => setTimeout(r, 300));
      }
      if (id === run.current) setSpeaking(false);
    },
    [browserVoice, fetchClip]
  );

  return { play, speaking, fallbackUsed, error };
}
