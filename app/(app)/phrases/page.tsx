import Link from "next/link";
import { Bi } from "@/components/Bi";
import { PhraseForm } from "@/components/PhraseForm";
import { PhraseList } from "@/components/PhraseList";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T } from "@/lib/ui-text";

export default async function PhrasesPage() {
  const userId = await requireUserId();
  const phrases = await prisma.phrase.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, pinyin: true, meaning: true, note: true, speechText: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl"><Bi label={T.myPhrases} align="start" /></h1>
      {phrases.length === 0 ? (
        <Link href="/onboarding" className="block rounded-2xl bg-white p-6 text-center text-lg shadow-sm">
          <Bi label={T.emptyPhrases} />
          <span className="mt-2 block text-teal-700"><Bi label={T.tapAddFirst} /></span>
        </Link>
      ) : (
        <>
          <details className="rounded-2xl bg-white p-4 shadow-sm">
            <summary className="flex min-h-11 cursor-pointer items-center text-teal-700">+ <Bi label={T.addPhrase} align="start" className="ml-2" /></summary>
            <div className="mt-3"><PhraseForm existing={phrases.map((p) => p.pinyin)} /></div>
          </details>
          <PhraseList phrases={phrases} />
        </>
      )}
    </div>
  );
}
