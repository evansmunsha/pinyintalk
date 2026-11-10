"use client";

import { useState, useTransition } from "react";
import { reportCommunityQuestionAction } from "@/app/actions/community-feedback";
import { Bi, ErrorBox } from "@/components/Bi";

export function CommunityQuestionReport({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-2">
      {!sent && (
        <button type="button" onClick={() => setOpen(!open)} className="min-h-9 rounded-lg px-2 text-xs text-stone-600 hover:bg-amber-50">
          <Bi label={{ py: "bàogào tiězi", en: "Report post" }} />
        </button>
      )}
      {open && !sent && (
        <form onSubmit={(event) => {
          event.preventDefault();
          setMessage("");
          start(async () => {
            const result = await reportCommunityQuestionAction({ questionId, note });
            if (result.ok) {
              setSent(true);
              setOpen(false);
            } else setMessage(result.error);
          });
        }} className="space-y-2 rounded-lg bg-amber-50 p-3">
          <label className="block">
            <Bi label={{ py: "kě xuǎn: shuōmíng wèntí", en: "Optional: add a note" }} align="start" className="mb-1 text-sm" />
            <textarea maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} rows={2}
              className="w-full rounded-lg border border-stone-300 bg-white p-2" />
          </label>
          <ErrorBox message={message} />
          <button disabled={pending} className="min-h-10 rounded-lg bg-amber-800 px-4 text-white">
            <Bi label={{ py: pending ? "zhèngzài fāsòng" : "fāsòng bàogào", en: pending ? "Sending…" : "Send report" }} />
          </button>
        </form>
      )}
      {sent && <p role="status" className="text-xs text-emerald-800"><Bi label={{ py: "bàogào yǐ fāsòng.", en: "Report sent." }} align="start" /></p>}
    </div>
  );
}
