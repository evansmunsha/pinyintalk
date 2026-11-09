import Link from "next/link";
import { Bi } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T, turnCount } from "@/lib/ui-text";

export default async function HistoryPage() {
  const userId = await requireUserId();
  // Only this learner's own conversations, newest first.
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      _count: { select: { turns: true } },
      turns: { orderBy: { createdAt: "asc" }, take: 1, select: { heardPinyin: true, heardEnglish: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl"><Bi label={T.history} align="start" /></h1>
      {conversations.length === 0 ? (
        <Link href="/mei" className="block rounded-2xl bg-white p-6 text-center text-lg shadow-sm">
          <Bi label={T.noConversations} />
          <span className="mt-2 block text-teal-700"><Bi label={T.startTalking} /></span>
        </Link>
      ) : (
        conversations.map((c) => (
          <Link key={c.id} href={`/history/${c.id}`} className="block space-y-1 rounded-2xl bg-white p-4 shadow-sm">
            <p className="flex items-center justify-between gap-2 text-sm text-stone-500">
              <time dateTime={c.updatedAt.toISOString()} suppressHydrationWarning>
                {c.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </time>
              <span><Bi label={turnCount(c._count.turns)} /></span>
            </p>
            <p className="break-words text-xl font-semibold"><Pinyin text={c.turns[0]?.heardPinyin ?? ""} /></p>
            <p className="break-words text-sm text-stone-600">{c.turns[0]?.heardEnglish}</p>
          </Link>
        ))
      )}
    </div>
  );
}
