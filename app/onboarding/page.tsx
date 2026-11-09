import Link from "next/link";
import { Bi } from "@/components/Bi";
import { PhraseForm } from "@/components/PhraseForm";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T } from "@/lib/ui-text";

export default async function OnboardingPage() {
  const userId = await requireUserId();
  const phrases = await prisma.phrase.findMany({ where: { userId }, select: { pinyin: true } });

  return (
    <main className="mx-auto w-full max-w-md space-y-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-2xl"><Bi label={T.onboardingTitle} align="start" /></h1>
        <p className="text-stone-600"><Bi label={T.onboardingHelp} align="start" /></p>
      </div>
      <PhraseForm existing={phrases.map((p) => p.pinyin)} showStarters />
      <Link href="/dashboard" className="block min-h-12 rounded-xl border-2 border-teal-600 py-3 text-center text-lg text-teal-700">
        <Bi label={phrases.length ? T.continue : T.skip} />
      </Link>
    </main>
  );
}
