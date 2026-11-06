"use client";

import { useCallback, useEffect, useState } from "react";

// Browser speechSynthesis with a zh-CN voice. Later: swap in server TTS or live audio here.
export function useSpeech() {
  const [slow, setSlow] = useState(false);
  const [noVoice, setNoVoice] = useState(false);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const check = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) setNoVoice(!voices.some((v) => v.lang.toLowerCase().startsWith("zh")));
    };
    check();
    window.speechSynthesis.addEventListener("voiceschanged", check);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", check);
  }, []);

  // `text` should be the hidden Chinese speech text when available.
  const speak = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window) || !text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "zh-CN";
      u.rate = slow ? 0.6 : 0.95;
      const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("zh"));
      if (voice) u.voice = voice;
      window.speechSynthesis.speak(u);
    },
    [slow]
  );

  return { speak, slow, setSlow, noVoice };
}
