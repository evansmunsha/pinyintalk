"use client";

import { useState, useTransition } from "react";
import { Bi } from "@/components/Bi";
import { setEnglishAfterAction } from "@/app/actions/settings";
import { T } from "@/lib/ui-text";

export function EnglishAfterToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    start(async () => {
      const res = await setEnglishAfterAction(next);
      if (!res.ok) setOn(!next);
    });
  }

  return (
    <button role="switch" aria-checked={on} onClick={toggle} disabled={pending}
      className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left shadow-sm">
      <Bi label={T.englishAfter} align="start" />
      <span className={`flex h-8 w-14 shrink-0 items-center rounded-full p-1 ${on ? "bg-teal-600" : "bg-stone-300"}`}>
        <span className={`h-6 w-6 rounded-full bg-white transition-transform ${on ? "translate-x-6" : ""}`} />
      </span>
    </button>
  );
}
