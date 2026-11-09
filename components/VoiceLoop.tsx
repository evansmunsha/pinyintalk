"use client";

import { useEffect, useRef, useState } from "react";
import { Bi, ErrorBox } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { useMeiVoice, warmUpCommonClips } from "@/lib/useMeiVoice";
import { useRecorder } from "@/lib/useRecorder";
import { T, recording, type Label } from "@/lib/ui-text";

type Heard = { pinyin: string; english: string };
type MeiSaid = { pinyin: string; speech?: string; english: string };
type Status = "ready" | "recording" | "thinking" | "speaking";

// Full loop: mic -> /api/voice/listen -> /api/voice/reply -> Mei speaks Mandarin, then English.
export function VoiceLoop() {
  const rec = useRecorder();
  const voice = useMeiVoice();
  const [busy, setBusy] = useState(false);
  const [heard, setHeard] = useState<Heard | null>(null);
  const [said, setSaid] = useState<MeiSaid | null>(null);
  const [error, setError] = useState("");
  const history = useRef<{ role: "user" | "model"; text: string }[]>([]);

  useEffect(() => {
    warmUpCommonClips();
  }, []);

  const status: Status = rec.state === "recording" ? "recording" : busy ? "thinking" : voice.speaking ? "speaking" : "ready";

  const partsOf = (m: MeiSaid) => [
    { text: m.pinyin, lang: "zh" as const, speechText: m.speech },
    { text: m.english, lang: "en" as const },
  ];

  async function handle(blob: Blob | null) {
    if (!blob) return setError("The recording was empty or could not be read. Hold the phone near you, speak for 2+ seconds, then tap to stop.");
    setBusy(true);
    setError("");
    const t0 = performance.now();
    try {
      const form = new FormData();
      form.append("audio", blob, "speech.wav");
      form.append("history", JSON.stringify(history.current.slice(-6)));
      const res = await fetch("/api/voice/listen", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error([data.error ?? "Could not understand the recording", data.detail].filter(Boolean).join(" — "));
      const tGemini = performance.now() - t0;

      history.current.push({ role: "user", text: data.heard.pinyin });
      history.current.push({ role: "model", text: `${data.reply.pinyin} (${data.reply.english})` });
      setHeard(data.heard);
      setSaid(data.reply);
      setBusy(false);

      // Both speech clips are requested at the same time; playback starts when the first is ready.
      const tPlay = performance.now();
      const done = voice.play(partsOf(data.reply));
      await done;
      console.log(`[timing] listen+reply ${Math.round(tGemini)}ms, speak ${Math.round(performance.now() - tPlay)}ms, total ${Math.round(performance.now() - t0)}ms`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function toggle() {
    if (busy) return;
    if (rec.state === "recording") return handle(await rec.stop());
    await rec.start(handle);
  }

  const label: Label =
    status === "recording" ? recording(rec.seconds) : status === "thinking" ? T.thinking : status === "speaking" ? T.speaking : T.tapToTalk;

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3">
        <button onClick={toggle} disabled={busy} aria-label="Microphone"
          className={`flex h-28 w-28 items-center justify-center rounded-full text-5xl text-white shadow-lg ${status === "recording" ? "animate-pulse bg-red-600" : "bg-teal-600"} disabled:opacity-60`}>
          🎤
        </button>
        <div className="flex items-center gap-2 text-lg text-stone-700" role="status" aria-live="polite">
          <Bi label={label} />
          {status === "thinking" && (
            <span className="flex gap-1" aria-hidden>
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-2.5 w-2.5 animate-bounce rounded-full bg-teal-600" style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
          )}
        </div>
      </div>

      {rec.state === "blocked" && (
        <div className="rounded-2xl bg-amber-50 p-4 text-amber-900"><Bi label={T.micBlocked} align="start" /></div>
      )}
      {rec.state === "error" && (
        <div className="rounded-xl bg-red-50 p-3 text-red-800"><Bi label={T.micFailed} align="start" /></div>
      )}
      <ErrorBox message={error} />

      {heard && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-500"><Bi label={T.youSaid} align="start" /></p>
          <p className="text-2xl font-semibold"><Pinyin text={heard.pinyin} /></p>
          <p className="text-sm text-stone-600">{heard.english}</p>
        </div>
      )}

      {said && (
        <div className="space-y-2 rounded-2xl bg-teal-50 p-4">
          <p className="text-sm text-teal-800"><Bi label={T.meiSaid} align="start" /></p>
          <p className="break-words text-3xl font-semibold text-teal-950"><Pinyin text={said.pinyin} /></p>
          <p className="text-sm text-stone-700">{said.english}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={() => voice.play([partsOf(said)[0]])} className="min-h-11 rounded-full border border-teal-300 bg-white px-4">▶ <Bi label={T.replay} className="inline-flex" /></button>
            <button onClick={() => voice.play([partsOf(said)[0]], true)} className="min-h-11 rounded-full border border-teal-300 bg-white px-4">🐢 <Bi label={T.slow} className="inline-flex" /></button>
            <button onClick={() => voice.play([partsOf(said)[1]])} className="min-h-11 rounded-full border border-teal-300 bg-white px-4">▶ <Bi label={T.replayEnglish} className="inline-flex" /></button>
          </div>
        </div>
      )}

      {voice.fallbackUsed && (
        <div className="rounded-xl bg-amber-50 p-3 text-amber-900">
          <Bi label={{ py: T.voiceFallback.py, en: `${T.voiceFallback.en}${voice.error ? ` (${voice.error})` : ""}` }} align="start" />
        </div>
      )}
    </div>
  );
}
