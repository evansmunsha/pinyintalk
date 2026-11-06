"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { blobToWav } from "@/lib/toWav";

export const MAX_RECORD_SECONDS = 15;
export type RecorderState = "ready" | "recording" | "blocked" | "error";

// MediaRecorder with a 15 second cap. Returns a WAV blob from stop().
export function useRecorder() {
  const [state, setState] = useState<RecorderState>("ready");
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveStop = useRef<((b: Blob | null) => void) | null>(null);

  const clear = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(() => clear, []);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!recorder.current || recorder.current.state === "inactive") return resolve(null);
      resolveStop.current = resolve;
      recorder.current.stop();
    });
  }, []);

  const start = useCallback(async (onAutoStop: (blob: Blob | null) => void) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const rec = new MediaRecorder(stream);
      recorder.current = rec;
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = async () => {
        clear();
        stream.getTracks().forEach((t) => t.stop());
        setState("ready");
        let wav: Blob | null = null;
        try {
          wav = chunks.current.length ? await blobToWav(new Blob(chunks.current, { type: rec.mimeType })) : null;
        } catch {
          wav = null;
        }
        if (resolveStop.current) {
          resolveStop.current(wav);
          resolveStop.current = null;
        } else onAutoStop(wav);
      };
      rec.start();
      setSeconds(0);
      setState("recording");
      timer.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_RECORD_SECONDS && rec.state === "recording") rec.stop();
          return s + 1;
        });
      }, 1000);
    } catch (e) {
      setState(e instanceof DOMException && e.name === "NotAllowedError" ? "blocked" : "error");
    }
  }, []);

  return { state, seconds, start, stop };
}
