"use client";

import { useState, useTransition } from "react";
import { addPhraseAction } from "@/app/actions/phrases";
import { Bi, ErrorBox } from "@/components/Bi";
import { STARTER_PHRASES } from "@/lib/data/starterPhrases";
import { T } from "@/lib/ui-text";

// Add-one-phrase form plus tap-to-add starter phrases.
export function PhraseForm({ existing, showStarters }: { existing: string[]; showStarters?: boolean }) {
  const [pinyin, setPinyin] = useState("");
  const [meaning, setMeaning] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [added, setAdded] = useState<string[]>([]);
  const have = new Set([...existing, ...added].map((p) => p.toLowerCase()));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await addPhraseAction({ pinyin, meaning });
      if (res.ok) {
        setAdded((a) => [...a, pinyin]);
        setPinyin("");
        setMeaning("");
      } else setError(res.error);
    });
  }

  function addStarter(p: (typeof STARTER_PHRASES)[number]) {
    start(async () => {
      const res = await addPhraseAction(p);
      if (res.ok) setAdded((a) => [...a, p.pinyin]);
      else setError(res.error);
    });
  }

  const input = "min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-lg";
  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <Bi label={T.phraseInPinyin} align="start" className="mb-1" />
          <input className={input} value={pinyin} onChange={(e) => setPinyin(e.target.value)}
            placeholder="Pinyin phrase" autoCapitalize="none" />
        </label>
        <label className="block">
          <Bi label={T.meaning} align="start" className="mb-1" />
          <input className={input} value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="hello" />
        </label>
        <ErrorBox message={error} />
        <button disabled={pending} className="min-h-12 w-full rounded-xl bg-teal-600 text-lg text-white disabled:opacity-60">
          <Bi label={T.add} />
        </button>
      </form>

      {showStarters && (
        <section>
          <h2 className="mb-2 text-stone-700"><Bi label={T.quickAdd} align="start" /></h2>
          <div className="flex flex-wrap gap-2">
            {STARTER_PHRASES.map((p) => {
              const done = have.has(p.pinyin.toLowerCase());
              return (
                <button key={p.pinyin} type="button" disabled={done || pending} onClick={() => addStarter(p)}
                  className={`min-h-11 rounded-full border px-4 text-left ${done ? "border-teal-200 bg-teal-50 text-teal-700" : "border-stone-300 bg-white"}`}>
                  <Bi label={{ py: `${done ? "✓" : "+"} ${p.pinyin}`, en: p.meaning }} align="start" />
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
