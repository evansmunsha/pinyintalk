import Link from "next/link";
import { Bi } from "@/components/Bi";
import { MeiChat } from "@/components/MeiChat";
import { TalkConversation } from "@/components/TalkConversation";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { toTurnDTO } from "@/lib/turns";
import { T } from "@/lib/ui-text";
import { meiRemaining } from "@/lib/usage";

export default async function MeiPage({ searchParams }: { searchParams: Promise<{ c?: string; mode?: string }> }) {
  const userId = await requireUserId();
  const { c, mode } = await searchParams;
  const [user, remaining] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { englishAfterChinese: true } }),
    meiRemaining(userId),
  ]);
  const englishAfter = user?.englishAfterChinese ?? true;
  const typing = mode === "type";

  // Continue an old conversation. Only the owner can open it.
  const conversation = !typing && c
    ? await prisma.conversation.findFirst({ where: { id: c, userId }, include: { turns: { orderBy: { createdAt: "asc" } } } })
    : null;

  const tab = (active: boolean) =>
    `flex min-h-11 flex-1 items-center justify-center rounded-full ${active ? "bg-teal-600 text-white" : "text-stone-700"}`;

  return (
    <>
      <div className="mb-3 flex gap-1 rounded-full bg-stone-200 p-1 text-lg" role="tablist">
        <Link href="/mei" role="tab" aria-selected={!typing} className={tab(!typing)}><Bi label={T.talkMode} /></Link>
        <Link href="/mei?mode=type" role="tab" aria-selected={typing} className={tab(typing)}><Bi label={T.typeMode} /></Link>
      </div>
      {typing ? (
        <MeiChat remainingStart={remaining} englishAfter={englishAfter} />
      ) : (
        <TalkConversation
          key={conversation?.id ?? "new"}
          initialTurns={conversation ? conversation.turns.map(toTurnDTO) : []}
          initialConversationId={conversation?.id ?? null}
          remainingStart={remaining}
          englishAfter={englishAfter}
        />
      )}
    </>
  );
}
