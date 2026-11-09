"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AudioClip } from "@/components/AudioClip";
import { Bi, ErrorBox } from "@/components/Bi";
import { Thread, type TurnDTO } from "@/components/Thread";
import { useMeiVoice, type Part } from "@/lib/useMeiVoice";
import { useRecorder } from "@/lib/useRecorder";
import { T, messagesLeft, recording, type Label } from "@/lib/ui-text";

type TalkResponse = {
  heard: { pinyin: string; english: string };
  reply: { pinyin: string; speech?: string; english: string };
  turnId?: string;
  conversationId?: string;
  createdAt?: string;
  remaining?: number;
  saveFailed?: boolean;
};

// Voice conversation with Mei. Every turn is saved (recording, what Mei heard, her reply and both reply clips).
export function TalkConversation({
  initialTurns,
  initialConversationId,
  remainingStart,
  englishAfter,
}: {
  initialTurns: TurnDTO[];
  initialConversationId: string | null;
  remainingStart: number;
  englishAfter: boolean;
}) {
  const rec = useRecorder();
  const voice = useMeiVoice();
  const [turns, setTurns] = useState(initialTurns);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(remainingStart);
  const [preview, setPreview] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [unsaved, setUnsaved] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const lastReply = useRef<{ pinyin: string; speech?: string; english: string } | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length]);

  const status: "ready" | "recording" | "preview" | "thinking" | "speaking" =
    rec.state === "recording" ? "recording" : busy ? "thinking" : voice.speaking ? "speaking" : preview ? "preview" : "ready";

  const label: Label =
    status === "recording" ? recording(rec.seconds) : status === "thinking" ? T.thinking : status === "speaking" ? T.speaking : status === "preview" ? T.previewTitle : T.tapToTalk;

  function onRecorded(blob: Blob | null) {
    if (!blob) return setError("The recording was empty or could not be read. Speak for 2+ seconds, then tap to stop.");
    setError("");
    const url = URL.createObjectURL(blob);
    previewUrlRef.current = url;
    setPreview(blob);
    setPreviewUrl(url);
  }

  function clearPreview() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setPreview(null);
  }

  async function toggle() {
    if (busy) return;
    if (rec.state === "recording") return onRecorded(await rec.stop());
    clearPreview();
    await rec.start(onRecorded);
  }

  async function send() {
    if (!preview) return;
    const blob = preview;
    clearPreview();
    setBusy(true);
    setError("");
    try {
      const history = turns.slice(-3).flatMap((t) => [
        { role: "user" as const, text: t.heardPinyin },
        { role: "model" as const, text: `${t.replyPinyin} (${t.replyEnglish})` },
      ]);
      const form = new FormData();
      form.append("audio", blob, "speech.wav");
      form.append("history", JSON.stringify(history));
      form.append("save", "1");
      if (conversationId) form.append("conversationId", conversationId);

      const res = await fetch("/api/voice/listen", { method: "POST", body: form });
      const data = (await res.json()) as TalkResponse & { error?: string; detail?: string };
      if (!res.ok) throw new Error([data.error ?? "Could not understand the recording", data.detail].filter(Boolean).join(" — "));

      const id = data.turnId ?? `unsaved-${Date.now()}`;
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
        window.history.replaceState(null, "", `/mei?c=${data.conversationId}`);
      }
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      setUnsaved(!data.turnId);
      lastReply.current = data.reply;
      setTurns((t) => [
        ...t,
        {
          id,
          createdAt: data.createdAt ?? new Date().toISOString(),
          heardPinyin: data.heard.pinyin,
          heardEnglish: data.heard.english,
          replyPinyin: data.reply.pinyin,
          replyEnglish: data.reply.english,
          hasLearner: !!data.turnId,
          hasZh: false,
          hasEn: false,
        },
      ]);
      setBusy(false);

      // The server saves each clip to this turn while it is generated.
      const turnId = data.turnId;
      const parts: Part[] = [{ text: data.reply.pinyin, lang: "zh", speechText: data.reply.speech, turnId }];
      if (englishAfter) parts.push({ text: data.reply.english, lang: "en", turnId });
      await voice.play(parts);
      if (turnId) setTurns((t) => t.map((x) => (x.id === turnId ? { ...x, hasZh: true, hasEn: englishAfter } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  function slowReplay() {
    if (lastReply.current) voice.play([{ text: lastReply.current.pinyin, lang: "zh", speechText: lastReply.current.speech }], true);
  }

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-col md:min-h-[calc(100dvh-4rem)]">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm text-stone-500">
        <Bi label={messagesLeft(remaining)} align="start" />
        <Link href="/mei" className="flex min-h-11 items-center rounded-full border border-stone-300 bg-white px-4 text-stone-800">
          + <Bi label={T.newConversation} className="ml-2" />
        </Link>
      </div>

      <div className="flex-1 space-y-4">
        {turns.length === 0 && (
          <div className="rounded-2xl bg-white p-4 text-center text-lg text-stone-700 shadow-sm">
            <Bi label={T.startTalking} />
          </div>
        )}
        <Thread turns={turns} />
        {turns.length > 0 && (
          <button onClick={slowReplay} className="min-h-11 rounded-full border border-stone-300 bg-white px-4 text-sm">
            🐢 <Bi label={T.slow} className="inline-flex" />
          </button>
        )}
        {unsaved && (
          <div className="rounded-xl bg-amber-50 p-3 text-amber-900"><Bi label={T.saveFailed} align="start" /></div>
        )}
        <ErrorBox message={error} />
        {rec.state === "blocked" && (
          <div className="rounded-2xl bg-amber-50 p-4 text-amber-900"><Bi label={T.micBlocked} align="start" /></div>
        )}
        {rec.state === "error" && (
          <div className="rounded-xl bg-red-50 p-3 text-red-800"><Bi label={T.micFailed} align="start" /></div>
        )}
        {voice.fallbackUsed && (
          <div className="rounded-xl bg-amber-50 p-3 text-amber-900">
            <Bi label={{ py: T.voiceFallback.py, en: `${T.voiceFallback.en}${voice.error ? ` (${voice.error})` : ""}` }} align="start" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-16 mt-3 space-y-3 bg-stone-50 py-3 md:bottom-0">
        {preview && previewUrl ? (
          <div className="space-y-3 rounded-2xl bg-white p-3 shadow-sm">
            <AudioClip src={previewUrl} label={T.previewTitle} />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setPreview(null)} className="min-h-12 rounded-xl border border-stone-300 bg-white"><Bi label={T.reRecord} /></button>
              <button onClick={send} className="min-h-12 rounded-xl bg-teal-600 text-white"><Bi label={T.send} /></button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button onClick={toggle} disabled={busy || remaining <= 0} aria-label="Microphone"
              className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl text-white shadow-lg disabled:opacity-60 ${status === "recording" ? "animate-pulse bg-red-600" : "bg-teal-600"}`}>
              🎤
            </button>
            <div className="flex items-center gap-2 text-stone-700" role="status" aria-live="polite">
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
        )}
      </div>
    </div>
  );
}
