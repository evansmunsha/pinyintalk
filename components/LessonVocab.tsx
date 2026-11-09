"use client";

import { useState, useTransition } from "react";
import { addLessonPhrasesAction } from "@/app/actions/learn";
import { Bi, ErrorBox } from "@/components/Bi";
import { HintCards } from "@/components/HintCards";
import { Pinyin } from "@/components/Pinyin";
import { PlayButton } from "@/components/PlayButton";
import { ReportMistake } from "@/components/ReportMistake";
import type { Vocab } from "@/lib/data/lessons";
import { T, phrasesAdded, type Label } from "@/lib/ui-text";

// Vocabulary of one lesson. Each phrase plays with Mei's voice and shows its hint cards.
export function LessonVocab({ lessonId, vocabulary }: { lessonId: string; vocabulary: Vocab[] }) {
  const [done, setDone] = useState<Label | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function addAll() {
    setError("");
    start(async () => {
      const res = await addLessonPhrasesAction(lessonId);
      if (res.ok) setDone(phrasesAdded(res.added));
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-3">
      {vocabulary.map((v) => (
        <article key={v.pinyin} className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <PlayButton text={v.speech} label={`Play ${v.pinyin}`} />
            <div className="min-w-0 flex-1">
              <p className="break-words text-xl font-semibold"><Pinyin text={v.pinyin} /></p>
              <p className="text-sm text-stone-600">{v.meaning}</p>
              <ReportMistake exactText={`${v.pinyin}\n${v.meaning}`} />
            </div>
          </div>
          <HintCards pinyin={v.pinyin} />
        </article>
      ))}
      <ErrorBox message={error} />
      <button onClick={addAll} disabled={pending || !!done} className="min-h-12 w-full rounded-xl bg-teal-600 text-lg text-white disabled:opacity-70">
        <Bi label={done ?? T.addAllPhrases} />
      </button>
    </div>
  );
}
