import Link from "next/link";
import { notFound } from "next/navigation";
import { Bi } from "@/components/Bi";
import { HistoryConversation } from "@/components/HistoryConversation";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { toTurnDTO } from "@/lib/turns";
import { T } from "@/lib/ui-text";

export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  // Filtering by userId means nobody can open another learner's conversation.
  const conversation = await prisma.conversation.findFirst({
    where: { id, userId },
    include: { turns: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) notFound();

  return (
    <div className="space-y-4">
      <Link href="/history" className="flex min-h-11 items-center text-teal-700">← <Bi label={T.history} className="ml-2" /></Link>
      <p className="text-sm text-stone-500">
        <time dateTime={conversation.createdAt.toISOString()} suppressHydrationWarning>
          {conversation.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </time>
      </p>
      <HistoryConversation id={conversation.id} turns={conversation.turns.map(toTurnDTO)} />
    </div>
  );
}
