"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bi } from "@/components/Bi";

export function HistoryLoadError({ timedOut }: { timedOut: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <section role="alert" className="space-y-3 rounded-2xl bg-amber-50 p-4 text-amber-950">
      <h1 className="text-lg font-semibold">
        <Bi
          label={timedOut
            ? { py: "duìhuà dǎkāi tài màn le", en: "This conversation is taking too long to open." }
            : { py: "wèi néng dǎkāi duìhuà", en: "This conversation could not be opened." }}
          align="start"
        />
      </h1>
      <p className="text-sm">
        <Bi label={{ py: "qǐng jiǎnchá wǎngluò hòu zàicì shì yī cì.", en: "Check your connection, then try again." }} align="start" />
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => router.refresh())}
        className="min-h-12 rounded-xl bg-teal-700 px-5 text-white disabled:opacity-60"
      >
        <Bi label={{ py: pending ? "zhèngzài chóngxīn jiāzài" : "chóngxīn shì yī cì", en: pending ? "Retrying…" : "Retry" }} />
      </button>
    </section>
  );
}
