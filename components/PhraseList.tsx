"use client";

import { useState, useTransition } from "react";
import { deletePhraseAction, updatePhraseAction } from "@/app/actions/phrases";
import { HintCards } from "@/components/HintCards";
import { PlayButton } from "@/components/PlayButton";
import { normalizePinyin } from "@/lib/pinyin";
import type { PhraseDTO } from "@/lib/types";

export function PhraseList({ phrases }: { phrases: PhraseDTO[] }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [pinyin, setPinyin] = useState("");
  const [meaning, setMeaning] = useState("");
  const [error, setError] = useState("");
  const [, start] = useTransition();

  const q = normalizePinyin(query);
  const shown = phrases.filter(
    (p) => !q || normalizePinyin(p.pinyin).includes(q) || p.meaning.toLowerCase().includes(query.toLowerCase())
  );

  function save(id: string) {
    start(async () => {
      const res = await updatePhraseAction(id, { pinyin, meaning });
      if (res.ok) setEditing(null);
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-3">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search phrases"
        aria-label="Search phrases" className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-lg" />
      {shown.map((p) => (
        <article key={p.id} className="rounded-2xl bg-white p-4 shadow-sm">
          {editing === p.id ? (
            <div className="space-y-2">
              <input value={pinyin} onChange={(e) => setPinyin(e.target.value)} aria-label="Pinyin"
                className="min-h-11 w-full rounded-lg border border-stone-300 px-3 text-lg" />
              <input value={meaning} onChange={(e) => setMeaning(e.target.value)} aria-label="Meaning"
                className="min-h-11 w-full rounded-lg border border-stone-300 px-3" />
              {error && <p className="text-sm text-red-700">{error}</p>}
              <div className="flex gap-2">
                <button onClick={() => save(p.id)} className="min-h-11 flex-1 rounded-lg bg-teal-600 font-semibold text-white">Save</button>
                <button onClick={() => setEditing(null)} className="min-h-11 flex-1 rounded-lg border border-stone-300">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <PlayButton text={p.speechText ?? p.pinyin} label={`Play ${p.pinyin}`} />
                <div className="min-w-0 flex-1">
                  <p className="break-words text-xl font-semibold text-stone-900">{p.pinyin}</p>
                  <p className="text-stone-600">{p.meaning}</p>
                </div>
              </div>
              <HintCards pinyin={p.pinyin} />
              <div className="mt-3 flex gap-2">
                <button onClick={() => { setEditing(p.id); setPinyin(p.pinyin); setMeaning(p.meaning); setError(""); }}
                  className="min-h-11 flex-1 rounded-lg border border-stone-300 text-sm">Edit</button>
                <button onClick={() => confirm("Delete this phrase?") && start(async () => { await deletePhraseAction(p.id); })}
                  className="min-h-11 flex-1 rounded-lg border border-red-200 text-sm text-red-700">Delete</button>
              </div>
            </>
          )}
        </article>
      ))}
      {!shown.length && <p className="py-6 text-center text-stone-500">No phrases match your search.</p>}
    </div>
  );
}
