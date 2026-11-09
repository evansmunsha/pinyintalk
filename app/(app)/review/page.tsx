import Link from "next/link";
import { Bi } from "@/components/Bi";
import { ReviewGame } from "@/components/ReviewGame";
import { LIMITS } from "@/lib/config";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T } from "@/lib/ui-text";

const select = { id: true, pinyin: true, meaning: true, note: true, speechText: true } as const;

export default async function ReviewPage() {
  const userId = await requireUserId();
  const [due, all] = await Promise.all([
    prisma.phrase.findMany({ where: { userId, nextReviewAt: { lte: new Date() } }, orderBy: { nextReviewAt: "asc" }, take: LIMITS.reviewBatchSize, select }),
    prisma.phrase.findMany({ where: { userId }, select }),
  ]);

  if (!due.length) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-5xl">{all.length ? "✅" : "📒"}</p>
        <h1 className="text-2xl"><Bi label={all.length ? T.nothingDue : T.noPhrasesYet} /></h1>
        <p className="text-stone-600"><Bi label={all.length ? T.comeBack : T.addPhrasesFirst} /></p>
        <Link href={all.length ? "/mei" : "/onboarding"} className="block min-h-12 rounded-xl bg-teal-600 py-3 text-lg text-white">
          <Bi label={all.length ? T.chatWithMei : T.add} />
        </Link>
      </div>
    );
  }
  return <ReviewGame due={due} all={all} />;
}
