import Link from "next/link";
import { ReviewGame } from "@/components/ReviewGame";
import { LIMITS } from "@/lib/config";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

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
        <h1 className="text-2xl font-bold">{all.length ? "Nothing due right now" : "No phrases yet"}</h1>
        <p className="text-stone-600">
          {all.length ? "Come back later. Your phrases will return on schedule." : "Add the phrases you know first."}
        </p>
        <Link href={all.length ? "/mei" : "/onboarding"} className="block min-h-12 rounded-xl bg-teal-600 py-3 text-lg font-semibold text-white">
          {all.length ? "Chat with Mei" : "Add phrases"}
        </Link>
      </div>
    );
  }
  return <ReviewGame due={due} all={all} />;
}
