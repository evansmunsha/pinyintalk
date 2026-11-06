"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Oops, something went wrong</h1>
      <p className="text-stone-600">Please try again.</p>
      <button onClick={reset} className="min-h-12 rounded-xl bg-teal-600 text-lg font-semibold text-white">Try again</button>
    </main>
  );
}
