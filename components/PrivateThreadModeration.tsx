"use client";

import { useState, useTransition, type FormEvent } from "react";
import { blockUserAction, reportPrivateThreadAction } from "@/app/actions/social";
import { Bi } from "@/components/Bi";

export function PrivateThreadModeration({ targetUserId }: { targetUserId: string }) {
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  function handleBlock() {
    start(async () => {
      const result = await blockUserAction(targetUserId);
      setMessage(result.ok ? "User blocked." : result.error);
    });
  }

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    start(async () => {
      const result = await reportPrivateThreadAction({ targetUserId, note: note.trim() });
      if (result.ok) {
        setOpen(false);
        setNote("");
        setMessage("Report sent. Thanks for helping keep the chat safe.");
      } else {
        setMessage(result.error);
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={handleBlock}
          className="min-h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm font-medium text-stone-700 disabled:opacity-60"
        >
          <Bi label={{ py: "zhǎng", en: "Block" }} />
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen((current) => !current)}
          className="min-h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm font-medium text-stone-700 disabled:opacity-60"
        >
          <Bi label={{ py: "bàogào", en: "Report" }} />
        </button>
      </div>

      {open && (
        <form onSubmit={submitReport} className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
          <label className="block text-sm font-medium text-stone-700">
            <Bi label={{ py: "bàogào míngxiàn", en: "What is the problem?" }} align="start" />
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Describe the issue in pinyin or English…"
            className="min-h-24 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending || note.trim().length < 3}
            className="min-h-10 rounded-xl bg-teal-600 px-3 text-sm font-medium text-white disabled:opacity-60"
          >
            <Bi label={{ py: "fāsòng bàogào", en: "Send report" }} />
          </button>
        </form>
      )}

      {message && <p className="text-sm text-stone-700">{message}</p>}
    </div>
  );
}
