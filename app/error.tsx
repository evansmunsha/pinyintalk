"use client";

import { Bi } from "@/components/Bi";
import { T } from "@/lib/ui-text";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl"><Bi label={T.oops} /></h1>
      <button onClick={reset} className="min-h-12 rounded-xl bg-teal-600 text-lg text-white"><Bi label={T.tryAgain} /></button>
    </main>
  );
}
