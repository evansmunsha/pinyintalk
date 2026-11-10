"use client";

import { useState, useTransition } from "react";
import { applyForTeacherAction } from "@/app/actions/community-roles";
import { Bi, ErrorBox } from "@/components/Bi";

export function TeacherApplicationForm({ initialStatus }: { initialStatus?: string }) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(initialStatus ?? "");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    start(async () => {
      const result = await applyForTeacherAction(note);
      if (result.ok) setStatus("pending");
      else setError(result.error);
    });
  }

  if (status) {
    const labels: Record<string, { py: string; en: string }> = {
      pending: { py: "dài shěnchá", en: "Application pending" },
      approved: { py: "yǐ pīzhǔn", en: "Approved teacher" },
      rejected: { py: "wèi pīzhǔn", en: "Not approved" },
    };
    return <p className="rounded-xl bg-white p-4 shadow-sm"><Bi label={labels[status] ?? labels.pending} align="start" /></p>;
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm text-stone-600"><Bi label={{ py: "qǐng jiǎnduǎn jièshào nǐ de hànyǔ jīngyàn hé nǐ xiǎng zěnyàng bāngzhù xuéshēng.", en: "Briefly describe your Mandarin experience and how you would help learners." }} align="start" /></p>
      <textarea required minLength={20} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} rows={5}
        className="w-full rounded-xl border border-stone-300 p-3" />
      <ErrorBox message={error} />
      <button disabled={pending} className="min-h-12 w-full rounded-xl bg-teal-700 text-white disabled:opacity-60">
        <Bi label={{ py: pending ? "zhèngzài fāsòng" : "tíjiāo shēnqǐng", en: pending ? "Sending…" : "Submit application" }} />
      </button>
    </form>
  );
}
