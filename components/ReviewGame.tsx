"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { recordAnswerAction } from "@/app/actions/phrases";
import { HintCards } from "@/components/HintCards";
import { FILLER_MEANINGS } from "@/lib/data/starterPhrases";
import { useSpeech } from "@/lib/useSpeech";
import type { PhraseDTO } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildOptions(current: PhraseDTO, all: PhraseDTO[]) {
  const pool = [...new Set([...all.filter((p) => p.id !== current.id).map((p) => p.meaning), ...FILLER_MEANINGS])]
    .filter((m) => m.toLowerCase() !== current.meaning.toLowerCase());
  return shuffle([current.meaning, ...shuffle(pool).slice(0, 3)]);
}

export function ReviewGame({ due, all }: { due: PhraseDTO[]; all: PhraseDTO[] }) {
  const [queue, setQueue] = useState(due);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [retried, setRetried] = useState<string[]>([]);
  const { speak, slow, setSlow, noVoice } = useSpeech();

  const current = queue[index];
  const options = useMemo(() => (current ? buildOptions(current, all) : []), [current, all]);

  if (!current) {
    return (
      <div className="space-y-5 py-8 text-center">
        <p className="text-5xl">🎉</p>
        <h1 className="text-2xl font-bold">Session done</h1>
        <p className="text-lg">{right} right · best streak {best}</p>
        <Link href="/review" onClick={() => location.reload()} className="block min-h-12 rounded-xl bg-teal-600 py-3 text-lg font-semibold text-white">
          Practise again
        </Link>
        <Link href="/dashboard" className="block min-h-12 rounded-xl border border-stone-300 py-3 text-lg">Done</Link>
      </div>
    );
  }

  function choose(option: string) {
    if (picked) return;
    const correct = option === current.meaning;
    setPicked(option);
    recordAnswerAction(current.id, correct);
    if (correct) {
      setRight((r) => r + 1);
      setStreak((s) => { setBest((b) => Math.max(b, s + 1)); return s + 1; });
    } else {
      setStreak(0);
      // A wrong phrase comes back once in this session.
      if (!retried.includes(current.id)) {
        setRetried((r) => [...r, current.id]);
        setQueue((q) => [...q, current]);
      }
    }
  }

  const speechText = current.speechText ?? current.pinyin;
  return (
    <div className="space-y-5">
      <p className="text-sm text-stone-500">{index + 1} of {queue.length} · streak {streak}</p>
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 shadow-sm">
        <button onClick={() => speak(speechText)} aria-label="Play phrase"
          className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-600 text-4xl text-white active:bg-teal-700">▶</button>
        <p className="text-stone-600">Listen, then pick the meaning</p>
        <button onClick={() => setSlow(!slow)} className="min-h-11 rounded-full border border-stone-300 px-4 text-sm">
          Speed: {slow ? "slow" : "normal"}
        </button>
        {noVoice && <p className="text-center text-sm text-amber-800">No Mandarin voice found on this device. Check your phone&apos;s text-to-speech settings.</p>}
      </div>

      <div className="space-y-2">
        {options.map((o) => {
          const isRight = o === current.meaning;
          const style = !picked ? "border-stone-300 bg-white" : isRight ? "border-green-500 bg-green-50" : o === picked ? "border-red-400 bg-red-50" : "border-stone-200 bg-white opacity-60";
          return (
            <button key={o} onClick={() => choose(o)} disabled={!!picked}
              className={`min-h-14 w-full rounded-xl border-2 px-4 text-left text-lg ${style}`}>{o}</button>
          );
        })}
      </div>

      {picked && (
        <div className="space-y-3">
          <p className={`text-lg font-semibold ${picked === current.meaning ? "text-green-700" : "text-red-700"}`}>
            {picked === current.meaning ? "Correct!" : "Not quite"}
          </p>
          <div className="rounded-2xl bg-teal-50 p-4">
            <p className="text-2xl font-semibold text-teal-900">{current.pinyin}</p>
            <p className="text-stone-700">{current.meaning}</p>
            <HintCards pinyin={current.pinyin} />
          </div>
          <button onClick={() => { setPicked(null); setIndex((i) => i + 1); }}
            className="min-h-12 w-full rounded-xl bg-teal-600 text-lg font-semibold text-white">Next</button>
        </div>
      )}
    </div>
  );
}
