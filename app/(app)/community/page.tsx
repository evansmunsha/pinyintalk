import Link from "next/link";
import { AskQuestion } from "@/components/AskQuestion";
import { Bi } from "@/components/Bi";
import { CommunityPost } from "@/components/CommunityPost";
import { CommunityRoleBadge } from "@/components/CommunityRoleBadge";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T } from "@/lib/ui-text";

export default async function CommunityPage() {
  const userId = await requireUserId();
  const [user, questions, pendingInvites] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true, nativeSpeaker: true } }),
    prisma.communityQuestion.findMany({
      where: { groupId: null },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: { select: { name: true, profileImageUrl: true, role: true, nativeSpeaker: true } },
        group: { select: { name: true } },
        responses: { orderBy: { createdAt: "asc" }, include: { teacher: { select: { name: true, profileImageUrl: true, role: true, nativeSpeaker: true } } } },
        voiceFeedback: { orderBy: { createdAt: "asc" }, include: { user: { select: { id: true, name: true, profileImageUrl: true, role: true, nativeSpeaker: true } } } },
      },
    }),
    prisma.directMessageInvitation.count({ where: { recipientId: userId, status: "pending" } }),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl"><Bi label={T.community} align="start" /></h1>
      <div className="grid grid-cols-2 gap-2">
        <Link href="/community/people" className="flex min-h-12 items-center justify-center rounded-xl bg-white shadow-sm"><Bi label={T.people} /></Link>
        <Link href="/community/messages" className="relative flex min-h-12 items-center justify-center rounded-xl bg-white shadow-sm"><Bi label={T.messages} />{pendingInvites > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-teal-600 px-2 py-0.5 text-xs text-white">{pendingInvites}</span>}</Link>
        <Link href="/community/inbox" className="col-span-2 flex min-h-12 items-center justify-center rounded-xl bg-white shadow-sm"><Bi label={{ py: "xìnxiǎn", en: "Inbox" }} /></Link>
        <Link href="/community/groups" className="col-span-2 flex min-h-12 items-center justify-center rounded-xl bg-white shadow-sm"><Bi label={{ py: "xuéxí xiǎozǔ", en: "Learning groups" }} /></Link>
        <Link href="/community/teacher-application" className="col-span-2 flex min-h-12 items-center justify-center rounded-xl bg-white shadow-sm"><Bi label={{ py: "shēnqǐng chéngwéi lǎoshī", en: "Apply to teach" }} /></Link>
      </div>
      {user && <p className="flex flex-wrap items-center gap-2"><Bi label={{ py: "nǐ de juésè", en: "Your role" }} align="start" /><CommunityRoleBadge role={user.role} nativeSpeaker={user.nativeSpeaker} /></p>}
      <AskQuestion />
      {questions.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <Bi label={T.noQuestions} />
          <p className="mt-2 text-teal-700"><Bi label={T.beFirst} /></p>
        </div>
      ) : (
        questions.map((question) => <CommunityPost key={question.id} question={question} currentUserId={userId} canReply={user?.role === "teacher"} />)
      )}
    </div>
  );
}
