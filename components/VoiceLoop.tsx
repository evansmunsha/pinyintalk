"use client";

import { useRef, useState } from "react";
import { useMeiVoice } from "@/lib/useMeiVoice";
import { useRecorder } from "@/lib/useRecorder";

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

  const status: Status = rec.state === "recording" ? "recording" : busy ? "thinking" : voice.speaking ? "speaking" : "ready";

  const partsOf = (m: MeiSaid) => [
    { text: m.pinyin, lang: "zh" as const, speechText: m.speech },
    { text: m.english, lang: "en" as const },
  ];

  async function handle(blob: Blob | null) {
    if (!blob) return setError("I didn't catch that, try again.");
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("audio", blob, "speech.wav");
      const l = await fetch("/api/voice/listen", { method: "POST", body: form });
      const heardData = await l.json();
      if (!l.ok) throw new Error(heardData.error ?? "Could not understand the recording");
      setHeard(heardData);

      history.current.push({ role: "user", text: heardData.pinyin });
      const r = await fetch("/api/voice/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.current.slice(-10) }),
      });
      const replyData = await r.json();
      if (!r.ok) throw new Error(replyData.error ?? "Mei could not reply");
      history.current.push({ role: "model", text: `${replyData.reply.pinyin} (${replyData.reply.english})` });
      setSaid(replyData.reply);
      setBusy(false);
      await voice.play(partsOf(replyData.reply));
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

  const label = { ready: "Tap to talk", recording: `Recording… ${rec.seconds}s (tap to stop)`, thinking: "Mei is thinking…", speaking: "Mei is speaking…" }[status];

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3">
        <button onClick={toggle} disabled={busy} aria-label="Microphone"
          className={`flex h-28 w-28 items-center justify-center rounded-full text-5xl text-white shadow-lg ${status === "recording" ? "animate-pulse bg-red-600" : "bg-teal-600"} disabled:opacity-60`}>
          🎤
        </button>
        <p className="font-medium text-stone-700">{label}</p>
      </div>

      {rec.state === "blocked" && (
        <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">The microphone is blocked.</p>
          <p>Android (Chrome): tap the lock icon next to the address, then Permissions, then allow Microphone.</p>
          <p>iPhone (Safari): Settings, Safari, Microphone, then choose Ask or Allow, and reload the page.</p>
        </div>
      )}
      {rec.state === "error" && <p className="rounded-xl bg-red-50 p-3 text-red-800">Could not use the microphone on this device.</p>}
      {error && <p className="rounded-xl bg-red-50 p-3 text-red-800">{error}</p>}

      {heard && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-500">You said:</p>
          <p className="text-xl font-semibold">{heard.pinyin}</p>
          <p className="text-stone-600">{heard.english}</p>
        </div>
      )}

      {said && (
        <div className="space-y-2 rounded-2xl bg-teal-50 p-4">
          <p className="text-sm text-teal-800">Mei said:</p>
          <p className="break-words text-2xl font-semibold text-teal-950">{said.pinyin}</p>
          <p className="text-stone-700">{said.english}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={() => voice.play([partsOf(said)[0]])} className="min-h-11 rounded-full border border-teal-300 bg-white px-4">▶ Replay Mandarin</button>
            <button onClick={() => voice.play([partsOf(said)[0]], true)} className="min-h-11 rounded-full border border-teal-300 bg-white px-4">🐢 Slow</button>
            <button onClick={() => voice.play([partsOf(said)[1]])} className="min-h-11 rounded-full border border-teal-300 bg-white px-4">▶ Replay English</button>
          </div>
        </div>
      )}

      {voice.fallbackUsed && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Mei&apos;s Gemini voice was not available, so your phone&apos;s built-in voice is used instead.
          {voice.error ? ` (${voice.error})` : ""}
        </p>
      )}
    </div>
  );
}
