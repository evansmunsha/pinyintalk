"use client";

import { useState, useTransition } from "react";
import { submitDrillAction, type DrillResult } from "@/app/actions/learn";
import { Bi, ErrorBox } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { useMeiVoice } from "@/lib/useMeiVoice";
import { T, drillScore } from "@/lib/ui-text";

type Question = { id: string; text: string; options: string[] };

// `speech` is hidden Chinese text used only to make the audio. It is never shown.
export function DrillPlayer({ drillId, speech, questions }: { drillId: string; speech: string; questions: Question[] }) {
  const voice = useMeiVoice();
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [result, setResult] = useState<DrillResult | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const part = [{ text: speech, lang: "zh" as const }];
  const allAnswered = answers.every((a) => a >= 0);

  function submit() {
    setError("");
    start(async () => {
      const res = await submitDrillAction({ drillId, answers });
      if (res.ok) setResult(res.result);
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-3xl bg-white p-5 text-center shadow-sm">
        <div className="flex h-12 items-end justify-center gap-1" aria-hidden>
          {Array.from({ length: 24 }, (_, i) => (
            <span
              key={i}
              className={`w-1.5 rounded-full bg-teal-500 ${voice.speaking ? "animate-pulse" : ""}`}
              style={{ height: `${voice.speaking ? 20 + ((i * 37) % 80) : 15 + ((i * 17) % 35)}%`, animationDelay: `${(i % 6) * 90}ms` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => voice.play(part)} className="min-h-12 rounded-xl bg-teal-600 text-white">▶ <Bi label={T.play} className="inline-flex" /></button>
          <button onClick={() => voice.play(part, true)} className="min-h-12 rounded-xl border-2 border-teal-600 text-teal-700">🐢 <Bi label={T.slow} className="inline-flex" /></button>
        </div>
        {voice.fallbackUsed && (
          <div className="rounded-xl bg-amber-50 p-3 text-amber-900"><Bi label={T.voiceFallback} /></div>
        )}
      </div>

      {questions.map((q, qi) => (
        <section key={q.id} className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-teal-700"><Bi label={{ py: `${T.question.py} ${qi + 1}`, en: `${T.question.en} ${qi + 1}` }} align="start" /></p>
          <p className="text-lg">{q.text}</p>
          {q.options.map((o, oi) => {
            const r = result?.results[qi];
            const chosen = answers[qi] === oi;
            const style = r
              ? oi === r.correctAnswer
                ? "border-green-500 bg-green-50"
                : chosen
                  ? "border-red-400 bg-red-50"
                  : "border-stone-200 opacity-60"
              : chosen
                ? "border-teal-600 bg-teal-50"
                : "border-stone-300 bg-white";
            return (
              <button key={o} disabled={!!result} onClick={() => setAnswers((a) => a.map((x, i) => (i === qi ? oi : x)))}
                className={`min-h-12 w-full rounded-xl border-2 px-4 text-left ${style}`}>{o}</button>
            );
          })}
        </section>
      ))}

      <ErrorBox message={error} />

      {result ? (
        <div className="space-y-2 rounded-2xl bg-teal-50 p-4">
          <p className="text-xl text-teal-900"><Bi label={drillScore(result.score, result.total)} align="start" /></p>
          <p className="text-sm text-teal-800"><Bi label={T.transcript} align="start" /></p>
          <p className="break-words text-2xl font-semibold"><Pinyin text={result.transcriptPinyin} /></p>
        </div>
      ) : (
        <button onClick={submit} disabled={!allAnswered || pending} className="min-h-12 w-full rounded-xl bg-teal-600 text-lg text-white disabled:opacity-50">
          <Bi label={T.submitAnswers} />
        </button>
      )}
    </div>
  );
}
