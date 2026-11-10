import Link from "next/link";
import { notFound } from "next/navigation";
import { Bi } from "@/components/Bi";
import { HistoryLoadError } from "@/components/HistoryLoadError";
import { HistoryConversation } from "@/components/HistoryConversation";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { toTurnDTO } from "@/lib/turns";
import { T } from "@/lib/ui-text";

const HISTORY_LOAD_TIMEOUT_MS = 15_000;

class HistoryLoadTimeout extends Error {}

async function findConversation(userId: string, id: string) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      prisma.conversation.findFirst({
        where: { id, userId },
        select: {
          id: true,
          createdAt: true,
          turns: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              createdAt: true,
              heardPinyin: true,
              heardEnglish: true,
              replyPinyin: true,
              replyEnglish: true,
              learnerAudioPath: true,
              replyZhAudioPath: true,
              replyEnAudioPath: true,
            },
          },
        },
      }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new HistoryLoadTimeout()), HISTORY_LOAD_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  // Filtering by userId means nobody can open another learner's conversation.
  let conversation;
  try {
    conversation = await findConversation(userId, id);
  } catch (error) {
    const timedOut = error instanceof HistoryLoadTimeout;
    console.error(timedOut ? "[history] conversation load timed out" : "[history] could not load conversation:", error);
    return <HistoryLoadError timedOut={timedOut} />;
  }
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
