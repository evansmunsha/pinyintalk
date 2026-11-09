import Link from "next/link";
import { Bi } from "@/components/Bi";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T, dueToday, hello } from "@/lib/ui-text";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const session = await auth();
  const [due, total] = await Promise.all([
    prisma.phrase.count({ where: { userId, nextReviewAt: { lte: new Date() } } }),
    prisma.phrase.count({ where: { userId } }),
  ]);
  const name = session?.user?.name?.split(" ")[0] ?? "friend";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl"><Bi label={hello(name)} align="start" /></h1>
      {total === 0 ? (
        <Link href="/onboarding" className="block rounded-2xl bg-white p-6 text-center text-lg shadow-sm">
          <Bi label={T.emptyPhrases} />
          <span className="mt-2 block text-teal-700"><Bi label={T.tapAddFirst} /></span>
        </Link>
      ) : (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-5xl font-bold text-teal-700">{due}</p>
          <p className="mt-1 text-lg text-stone-700"><Bi label={dueToday(due)} /></p>
        </div>
      )}
      <div className="space-y-3">
        <Link href="/review" className="block min-h-14 rounded-2xl bg-teal-600 py-3 text-center text-xl text-white"><Bi label={T.startReview} /></Link>
        <Link href="/phrases" className="block min-h-14 rounded-2xl border border-stone-300 bg-white py-3 text-center text-xl"><Bi label={T.myPhrases} /></Link>
      </div>
    </div>
  );
}
