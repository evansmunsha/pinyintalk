"use client";

import { useRef, useState } from "react";
import { addPhraseAction } from "@/app/actions/phrases";
import { useSpeech } from "@/lib/useSpeech";
import type { MeiReply } from "@/lib/types";

type Msg = { role: "user" | "model"; text: string; reply?: MeiReply; added?: boolean; help?: boolean };

export function MeiChat({ remainingStart }: { remainingStart: number }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(remainingStart);
  const { speak } = useSpeech();
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...msgs, { role: "user", text }];
    setMsgs(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/mei", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-10).map((m) => ({ role: m.role, text: m.reply ? `${m.reply.pinyin}\n${m.reply.english}` : m.text })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        if (typeof data.remaining === "number") setRemaining(data.remaining);
      } else {
        setMsgs([...next, { role: "model", text: data.reply.pinyin, reply: data.reply }]);
        setRemaining(data.remaining);
      }
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  async function addNew(i: number) {
    const np = msgs[i].reply?.newPhrase;
    if (!np) return;
    const res = await addPhraseAction({ pinyin: np.pinyin, meaning: np.meaning, speechText: np.speech });
    if (!res.ok && !res.error.includes("already")) return setError(res.error);
    setMsgs((m) => m.map((x, j) => (j === i ? { ...x, added: true } : x)));
  }

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-col md:min-h-[calc(100dvh-4rem)]">
      <p className="mb-3 text-sm text-stone-500">{remaining} messages left today</p>
      <div className="flex-1 space-y-3">
        {!msgs.length && (
          <div className="rounded-2xl bg-white p-4 text-stone-600">
            Say hi to Mei. Write in pinyin or in English, for example &quot;how do I say thank you?&quot;
            <div className="mt-3 flex flex-wrap gap-2">
              {["nǐ hǎo", "how do I say goodbye?"].map((s) => (
                <button key={s} onClick={() => send(s)} className="min-h-11 rounded-full border border-stone-300 px-4">{s}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-2xl bg-teal-600 px-4 py-3 text-lg text-white">{m.text}</div>
          ) : (
            <div key={i} className="max-w-[90%] space-y-2 rounded-2xl bg-white p-4 shadow-sm">
              <p className="break-words text-xl font-semibold">{m.reply?.pinyin}</p>
              <p className="text-stone-600">{m.reply?.english}</p>
              {m.help && <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900">{m.reply?.note}</p>}
              {m.reply?.newPhrase && (
                <p className="rounded-lg bg-teal-50 p-2 text-sm">
                  New: <b>{m.reply.newPhrase.pinyin}</b> = {m.reply.newPhrase.meaning}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => speak(m.reply?.speech || m.reply?.pinyin || "")} className="min-h-11 rounded-full border border-stone-300 px-4">▶ Play</button>
                {m.reply?.newPhrase && (
                  <button disabled={m.added} onClick={() => addNew(i)} className="min-h-11 rounded-full border border-teal-300 px-4 text-teal-800 disabled:opacity-60">
                    {m.added ? "✓ Added" : "Add to my phrases"}
                  </button>
                )}
                <button onClick={() => setMsgs((x) => x.map((y, j) => (j === i ? { ...y, help: !y.help } : y)))} className="min-h-11 rounded-full border border-stone-300 px-4">
                  Help in English
                </button>
              </div>
            </div>
          )
        )}
        {loading && <div className="h-16 w-40 animate-pulse rounded-2xl bg-stone-200" />}
        {error && <p className="rounded-xl bg-red-50 p-3 text-red-800">{error}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="sticky bottom-16 mt-3 flex gap-2 bg-stone-50 py-2 md:bottom-0">
        <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder="Message Mei"
          aria-label="Message Mei" className="min-h-12 min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 text-lg" />
        <button disabled={loading || remaining <= 0} className="min-h-12 rounded-xl bg-teal-600 px-5 font-semibold text-white disabled:opacity-60">Send</button>
      </form>
    </div>
  );
}
