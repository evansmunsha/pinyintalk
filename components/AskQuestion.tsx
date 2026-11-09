"use client";

import { useState, useTransition } from "react";
import { Bi, ErrorBox } from "@/components/Bi";
import { postQuestionAction } from "@/app/actions/community";
import { T } from "@/lib/ui-text";

const LEVELS = [
  { value: "beginner", label: T.beginner },
  { value: "tones", label: T.tones },
  { value: "travel", label: T.travel },
] as const;

export function AskQuestion() {
  const [text, setText] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]["value"]>("beginner");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await postQuestionAction({ text, level });
      if (res.ok) setText("");
      else setError(res.error);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <label className="block">
        <Bi label={T.askQuestion} align="start" className="mb-1" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={500}
          placeholder="Type a question in pinyin" className="w-full rounded-xl border border-stone-300 p-3 text-lg" />
      </label>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Level">
        {LEVELS.map((l) => (
          <button key={l.value} type="button" role="radio" aria-checked={level === l.value} onClick={() => setLevel(l.value)}
            className={`min-h-11 rounded-full border px-4 ${level === l.value ? "border-teal-600 bg-teal-50 text-teal-800" : "border-stone-300"}`}>
            <Bi label={l.label} />
          </button>
        ))}
      </div>
      <ErrorBox message={error} />
      <button disabled={pending} className="min-h-12 w-full rounded-xl bg-teal-600 text-lg text-white disabled:opacity-60">
        <Bi label={T.post} />
      </button>
    </form>
  );
}
