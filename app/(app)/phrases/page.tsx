import Link from "next/link";
import { PhraseForm } from "@/components/PhraseForm";
import { PhraseList } from "@/components/PhraseList";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function PhrasesPage() {
  const userId = await requireUserId();
  const phrases = await prisma.phrase.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, pinyin: true, meaning: true, note: true, speechText: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My phrases</h1>
      {phrases.length === 0 ? (
        <Link href="/onboarding" className="block rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-lg">You haven&apos;t added any phrases yet.</p>
          <p className="mt-1 font-semibold text-teal-700">Tap here to add your first one.</p>
        </Link>
      ) : (
        <>
          <details className="rounded-2xl bg-white p-4 shadow-sm">
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-teal-700">+ Add a phrase</summary>
            <div className="mt-3"><PhraseForm existing={phrases.map((p) => p.pinyin)} /></div>
          </details>
          <PhraseList phrases={phrases} />
        </>
      )}
    </div>
  );
}
