"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bi, ErrorBox } from "@/components/Bi";
import { VoiceNoteInput } from "@/components/VoiceNoteInput";
import { postQuestionAction } from "@/app/actions/community";
import { T } from "@/lib/ui-text";

const LEVELS = [
  { value: "beginner", label: T.beginner },
  { value: "tones", label: T.tones },
  { value: "travel", label: T.travel },
] as const;

export function AskQuestion({ groupId }: { groupId?: string } = {}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [meaning, setMeaning] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]["value"]>("beginner");
  const [error, setError] = useState("");
  const [voiceNote, setVoiceNote] = useState<Blob | null>(null);
  const [voiceInputKey, setVoiceInputKey] = useState(0);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      try {
        if (voiceNote) {
          const form = new FormData();
          form.append("text", text);
          form.append("meaning", meaning);
          form.append("level", level);
          if (groupId) form.append("groupId", groupId);
          form.append("audio", voiceNote, "voice-note.wav");
          const response = await fetch("/api/community/questions", { method: "POST", body: form });
          const result = (await response.json()) as { error?: string };
          if (!response.ok) throw new Error(result.error ?? "Could not post your question.");
          router.refresh();
        } else {
          const result = await postQuestionAction({ text, level, ...(groupId ? { groupId } : {}) });
          if (!result.ok) throw new Error(result.error);
          router.refresh();
        }
        setText("");
        setMeaning("");
        setVoiceNote(null);
        setVoiceInputKey((key) => key + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not post your question.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="space-y-1 rounded-xl bg-teal-50 p-3 text-sm text-teal-950">
        <p className="font-semibold"><Bi label={{ py: "zěnme xiàng dàjiā tíwèn", en: "How to ask the community" }} align="start" /></p>
        <p><Bi label={{ py: "qǐng yòng pīnyīn huò yīngwén xiěxià nǐ xiǎng qǐngjiào de wèntí.", en: "Write in pinyin or English what you want help with." }} align="start" /></p>
        <p><Bi label={{ py: "xiě shàng nà jù huà hé nǐ de wèntí. Lìzi: “Nǐ hǎo ma? Zhèlǐ de ma shì shénme yìsi?”", en: "Include the phrase and your question. Example: “Ni hao ma? What does ma mean here?”" }} align="start" /></p>
        <p><Bi label={{ py: "yě kěyǐ lù yī duàn duǎn yǔyīn. Qǐng bùyào tiánxiě hànzì huò gèrén xìnxī.", en: "You can also record a short voice note. Please do not include Chinese characters or personal information." }} align="start" /></p>
      </div>
      <label className="block">
        <Bi label={{ py: voiceNote ? "nǐ shuō de huà" : "wèn tí", en: voiceNote ? "What you tried to say (pinyin)" : "Your question (pinyin or English)" }} align="start" className="mb-1" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={500}
          placeholder="Write the phrase and what you want to know…" className="w-full rounded-xl border border-stone-300 p-3 text-lg" />
      </label>
      <VoiceNoteInput key={voiceInputKey} onChange={setVoiceNote} />
      {voiceNote && (
        <label className="block">
          <Bi label={{ py: "yīngwén yìsi", en: "Meaning in English" }} align="start" className="mb-1" />
          <textarea required value={meaning} onChange={(e) => setMeaning(e.target.value)} rows={2} maxLength={300}
            className="w-full rounded-xl border border-stone-300 p-3" />
        </label>
      )}
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
