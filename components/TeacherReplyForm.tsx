"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bi, ErrorBox } from "@/components/Bi";
import { VoiceNoteInput } from "@/components/VoiceNoteInput";

export function TeacherReplyForm({ questionId }: { questionId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [examplePinyin, setExamplePinyin] = useState("");
  const [voiceNote, setVoiceNote] = useState<Blob | null>(null);
  const [voiceInputKey, setVoiceInputKey] = useState(0);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      try {
        const form = new FormData();
        form.append("text", text);
        form.append("examplePinyin", examplePinyin);
        if (voiceNote) form.append("audio", voiceNote, "teacher-voice-note.wav");
        const response = await fetch(`/api/community/questions/${questionId}/responses`, { method: "POST", body: form });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Could not post your reply.");
        setText("");
        setExamplePinyin("");
        setVoiceNote(null);
        setVoiceInputKey((key) => key + 1);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not post your reply.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-teal-200 bg-white p-3">
      <h3 className="font-semibold"><Bi label={{ py: "lǎoshī huífù", en: "Teacher reply" }} align="start" /></h3>
      <label className="block">
        <span className="mb-1 block text-sm text-stone-700">Reply in English</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1000} required
          className="w-full rounded-xl border border-stone-300 p-3" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-stone-700">Optional pinyin example</span>
        <input value={examplePinyin} onChange={(e) => setExamplePinyin(e.target.value)} maxLength={240}
          className="w-full rounded-xl border border-stone-300 p-3" />
      </label>
      <VoiceNoteInput key={voiceInputKey} onChange={setVoiceNote} />
      <ErrorBox message={error} />
      <button disabled={pending} className="min-h-11 w-full rounded-xl bg-teal-700 px-4 text-white disabled:opacity-60">
        <Bi label={{ py: "fābiǎo huífù", en: "Post reply" }} />
      </button>
    </form>
  );
}
