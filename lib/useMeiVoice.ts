"use client";

import { useCallback, useRef, useState } from "react";

// `turnId` (optional): the server also saves the normal-speed clip to that saved conversation turn.
export type Part = { text: string; lang: "zh" | "en"; speechText?: string; turnId?: string };

function speakText(part: Part) {
  return part.lang === "zh" ? part.speechText || part.text : part.text;
}

// Common Mei lines, requested in the background so the first answer can play straight away.
export const COMMON_PARTS: Part[] = [
  { text: "nǐ hǎo", lang: "zh", speechText: "你好" },
  { text: "wǒ hěn hǎo, xièxie", lang: "zh", speechText: "我很好，谢谢" },
  { text: "wǒ jiào Mei", lang: "zh", speechText: "我叫Mei" },
  { text: "I said, hello.", lang: "en" },
  { text: "I said, I am very well, thank you.", lang: "en" },
  { text: "I said, my name is Mei.", lang: "en" },
];

function loadClip(part: Part): Promise<string> {
  const text = part.lang === "zh" ? part.speechText || part.text : part.text;
  const started = performance.now();
  return (async () => {
    const res = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang: part.lang, turnId: part.turnId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error([body.error ?? "Voice failed", body.detail].filter(Boolean).join(" — "));
    }
    const url = URL.createObjectURL(await res.blob());
    console.log(`[timing] speak ${part.lang}: ${Math.round(performance.now() - started)}ms`);
    return url;
  })();
}

export function warmUpCommonClips() {
  COMMON_PARTS.forEach((p) => loadClip(p).then(URL.revokeObjectURL, () => undefined));
}

// Plays Mei's voice from /api/voice/speak. Falls back to the browser voice (zh-CN) if Gemini fails.
export function useMeiVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [error, setError] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const run = useRef(0);

  const fetchClip = useCallback((part: Part) => loadClip(part), []);

  const playUrl = (url: string, id: number, slow: boolean) =>
    new Promise<void>((resolve, reject) => {
      if (id !== run.current) return resolve();
      const el = new Audio(url);
      el.playbackRate = slow ? 0.6 : 1;
      audio.current = el;
      el.onended = () => resolve();
      el.onpause = () => {
        if (id !== run.current) resolve();
      };
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
      const clips = parts.map((part) => fetchClip(part));
      clips.forEach((clip) => clip.catch(() => undefined));
      for (let i = 0; i < parts.length; i++) {
        if (id !== run.current) {
          clips.forEach((clip) => clip.then(URL.revokeObjectURL, () => undefined));
          return;
        }
        let url: string | null = null;
        try {
          url = await clips[i];
          await playUrl(url, id, slow);
        } catch (e) {
          if (id !== run.current) {
            clips.slice(i + 1).forEach((clip) => clip.then((url) => URL.revokeObjectURL(url), () => undefined));
            return;
          }
          setError(e instanceof Error ? e.message : "Voice failed");
          setFallbackUsed(true);
          await browserVoice(parts[i], slow);
        } finally {
          if (url) URL.revokeObjectURL(url);
        }
        if (i < parts.length - 1) await new Promise((r) => setTimeout(r, 300));
      }
      if (id === run.current) setSpeaking(false);
    },
    [browserVoice, fetchClip]
  );

  return { play, speaking, fallbackUsed, error };
}
