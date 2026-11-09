"use client";

import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useState, useTransition, type KeyboardEvent, type MouseEvent } from "react";
import { submitMistakeReport } from "@/app/actions/mistake-reports";
import { Pinyin } from "@/components/Pinyin";

const REPORT_LABEL = { py: "Bàogào cuòwù", en: "Report a mistake" };

export function ReportMistake({ exactText }: { exactText: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [text, setText] = useState(exactText.slice(0, 1000));
  const [note, setNote] = useState("");
  const [error, setError] = useState<{ py: string; en: string } | null>(null);
  const [pending, start] = useTransition();

  function showForm(event: MouseEvent<HTMLSpanElement>) {
    event.preventDefault();
    event.stopPropagation();
    setText(exactText.slice(0, 1000));
    setError(null);
    setOpen(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      setText(exactText.slice(0, 1000));
      setError(null);
      setOpen(true);
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    start(async () => {
      const result = await submitMistakeReport({ exactText: text, page: pathname || "/", note });
      if (result.ok) {
        setOpen(false);
        setReported(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <span className="inline-flex items-center gap-1.5">
        <span
          role="button"
          tabIndex={0}
          aria-label={`${REPORT_LABEL.py}: ${REPORT_LABEL.en}`}
          title={REPORT_LABEL.en}
          onClick={showForm}
          onKeyDown={handleKeyDown}
          className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full px-1 text-[10px] leading-tight text-stone-500 hover:bg-amber-50 hover:text-amber-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 14V2m1 1h8l-2 2 2 2H4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="flex flex-col items-start">
            <span className="font-semibold"><Pinyin text={REPORT_LABEL.py} /></span>
            <span>{REPORT_LABEL.en}</span>
          </span>
        </span>
      </span>
      {reported && (
        <span role="status" className="mt-1 flex flex-col text-xs text-emerald-800">
          <span><Pinyin text="xièxie nǐ de fǎnkuì." /></span>
          <span>Thank you for helping us improve.</span>
        </span>
      )}
      {open && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 sm:items-center">
          <section role="dialog" aria-modal="true" aria-labelledby="mistake-report-title" className="max-h-[90dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h2 id="mistake-report-title" className="text-lg font-semibold">
                <span className="block"><Pinyin text="bàogào cuòwù" /></span>
                <span className="text-sm font-normal text-stone-600">Report a mistake</span>
              </h2>
              <button type="button" aria-label="Close report form" onClick={() => setOpen(false)} className="min-h-11 min-w-11 rounded-full border border-stone-300 text-xl">×</button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <label className="block space-y-1">
                <span className="block text-sm font-medium"><Pinyin text="nǎ yí duàn wénzì yǒu cuò?" /> <span className="font-normal text-stone-600">Which text was wrong?</span></span>
                <textarea required maxLength={1000} value={text} onChange={(event) => setText(event.target.value)} rows={3} className="w-full rounded-xl border border-stone-300 p-3" />
              </label>
              <label className="block space-y-1">
                <span className="block text-sm font-medium"><Pinyin text="qǐng jiǎnduǎn shuōmíng wèntí." /> <span className="font-normal text-stone-600">What is wrong, or what should it say?</span></span>
                <textarea required minLength={3} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="w-full rounded-xl border border-stone-300 p-3" />
              </label>
              {error && (
                <p role="alert" className="text-sm text-red-800">
                  <span className="block"><Pinyin text={error.py} /></span>
                  <span>{error.en}</span>
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={pending} onClick={() => setOpen(false)} className="min-h-12 rounded-xl border border-stone-300">
                  <span className="block text-sm"><Pinyin text="qǔxiāo" /></span><span className="text-xs">Cancel</span>
                </button>
                <button type="submit" disabled={pending} className="min-h-12 rounded-xl bg-teal-700 text-white disabled:opacity-60">
                  <span className="block text-sm"><Pinyin text={pending ? "zhèngzài fāsòng" : "fāsòng"} /></span>
                  <span className="text-xs">{pending ? "Sending…" : "Send"}</span>
                </button>
              </div>
            </form>
          </section>
        </div>,
        document.body
      )}
    </>
  );
}
