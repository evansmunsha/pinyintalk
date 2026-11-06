import Link from "next/link";
import { PhraseForm } from "@/components/PhraseForm";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function OnboardingPage() {
  const userId = await requireUserId();
  const phrases = await prisma.phrase.findMany({ where: { userId }, select: { pinyin: true } });

  return (
    <main className="mx-auto w-full max-w-md space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Which Chinese phrases do you already know?</h1>
        <p className="mt-1 text-stone-600">Add them in pinyin. Yadalingo will help you keep them.</p>
      </div>
      <PhraseForm existing={phrases.map((p) => p.pinyin)} showStarters />
      <Link href="/dashboard" className="block min-h-12 rounded-xl border-2 border-teal-600 py-3 text-center text-lg font-semibold text-teal-700">
        {phrases.length ? "Continue" : "Skip for now"}
      </Link>
    </main>
  );
}
