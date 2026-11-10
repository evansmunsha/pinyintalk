import Link from "next/link";
import { notFound } from "next/navigation";
import { AskQuestion } from "@/components/AskQuestion";
import { Bi } from "@/components/Bi";
import { CommunityPost } from "@/components/CommunityPost";
import { JoinGroupButton } from "@/components/JoinGroupButton";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function CommunityGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const userId = await requireUserId();
  const { groupId } = await params;
  const [group, user] = await Promise.all([
    prisma.communityGroup.findUnique({
      where: { id: groupId },
      include: {
        owner: { select: { name: true } },
        members: { where: { userId }, select: { id: true } },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
  ]);
  if (!group) notFound();
  const isMember = group.members.length > 0;
  const posts = isMember ? await prisma.communityQuestion.findMany({
    where: { groupId: group.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, role: true, nativeSpeaker: true } },
      group: { select: { name: true } },
      responses: { orderBy: { createdAt: "asc" }, include: { teacher: { select: { name: true, role: true, nativeSpeaker: true } } } },
      voiceFeedback: { orderBy: { createdAt: "asc" }, include: { user: { select: { id: true, name: true, role: true, nativeSpeaker: true } } } },
    },
  }) : [];

  return (
    <div className="space-y-4">
      <Link href="/community/groups" className="flex min-h-11 items-center text-teal-700">← <Bi label={{ py: "xuéxí xiǎozǔ", en: "Learning groups" }} className="ml-2" /></Link>
      <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">{group.name}</h1>
        <p>{group.description}</p>
        <p className="text-sm text-stone-500"><Bi label={{ py: `chuàngjiàn zhě ${group.owner.name}`, en: "Group teacher" }} align="start" /></p>
        <JoinGroupButton groupId={group.id} isMember={isMember} />
      </section>
      {isMember && <AskQuestion groupId={group.id} />}
      {!isMember && <p className="rounded-xl bg-amber-50 p-3"><Bi label={{ py: "jiārù xiǎozǔ hòu kěyǐ kànjiàn hé fābiǎo tiězi.", en: "Join the group to see and post in its feed." }} align="start" /></p>}
      {isMember && posts.length === 0 && <p className="rounded-xl bg-white p-4"><Bi label={{ py: "zhèlǐ hái méiyǒu tiězi.", en: "No posts in this group yet." }} align="start" /></p>}
      {posts.map((question) => <CommunityPost key={question.id} question={question} currentUserId={userId} canReply={user?.role === "teacher"} />)}
    </div>
  );
}
