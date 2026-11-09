"use client";

import { useState } from "react";
import { Bi, ErrorBox } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { useMeiVoice } from "@/lib/useMeiVoice";
import { T } from "@/lib/ui-text";

export default function TestAiPage() {
  const voice = useMeiVoice();
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setReply("");
    setError("");
    try {
      const res = await fetch("/api/ai/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Something went wrong.");
      else setReply(data.reply);
    } catch {
      setError("Network problem. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 py-8">
      <h1 className="text-2xl"><Bi label={T.testTitle} align="start" /></h1>
      <button
        onClick={run}
        disabled={loading}
        className="min-h-12 rounded-xl bg-teal-600 px-4 text-lg text-white disabled:opacity-60"
      >
        <Bi label={loading ? T.thinking : T.testSayHello} />
      </button>
      {reply && (
        <p className="whitespace-pre-line rounded-2xl bg-teal-50 p-4 text-lg text-teal-900">
          {reply}
        </p>
      )}
      <ErrorBox message={error} />

      <section className="space-y-3 border-t border-stone-200 pt-6">
        <h2 className="text-xl"><Bi label={T.hearMei} align="start" /></h2>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold"><Pinyin text="nǐ hǎo ma" /></p>
          <p className="text-sm text-stone-600">how are you?</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => voice.play([{ text: "nǐ hǎo ma", lang: "zh", speechText: "你好吗" }])}
            className="min-h-12 flex-1 rounded-xl bg-teal-600 text-white">▶ <Bi label={T.normal} className="inline-flex" /></button>
          <button onClick={() => voice.play([{ text: "nǐ hǎo ma", lang: "zh", speechText: "你好吗" }], true)}
            className="min-h-12 flex-1 rounded-xl border-2 border-teal-600 text-teal-700">🐢 <Bi label={T.slow} className="inline-flex" /></button>
        </div>
        {voice.fallbackUsed && (
          <div className="rounded-xl bg-amber-50 p-3 text-amber-900">
            <Bi label={{ py: T.voiceFallback.py, en: `${T.voiceFallback.en} ${voice.error}` }} align="start" />
          </div>
        )}
      </section>
    </main>
  );
}
