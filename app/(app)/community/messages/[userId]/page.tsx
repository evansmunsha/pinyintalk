import Link from "next/link";
import { notFound } from "next/navigation";
import { Bi } from "@/components/Bi";
import { CommunityRoleBadge } from "@/components/CommunityRoleBadge";
import { DirectThread } from "@/components/DirectThread";
import { FollowButton } from "@/components/FollowButton";
import { UserAvatar } from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T } from "@/lib/ui-text";

export default async function ThreadPage({ params }: { params: Promise<{ userId: string }> }) {
  const me = await requireUserId();
  const { userId: otherId } = await params;
  if (otherId === me) notFound();

  const other = await prisma.user.findUnique({ where: { id: otherId }, select: { id: true, name: true, profileImageUrl: true, role: true, nativeSpeaker: true } });
  if (!other) notFound();

  // Only this pair's messages. Opening the thread marks the incoming ones as read.
  await prisma.directMessage.updateMany({ where: { senderId: other.id, recipientId: me, readAt: null }, data: { readAt: new Date() } });
  const [messages, follows] = await Promise.all([
    prisma.directMessage.findMany({
      where: { OR: [{ senderId: me, recipientId: other.id }, { senderId: other.id, recipientId: me }] },
      orderBy: { createdAt: "asc" },
      take: 300,
      include: { sender: { select: { name: true, profileImageUrl: true, role: true, nativeSpeaker: true } } },
    }),
    prisma.follow.findUnique({ where: { followerId_followingId: { followerId: me, followingId: other.id } }, select: { id: true } }),
  ]);

  return (
    <div className="space-y-4">
      <Link href="/community/messages" className="flex min-h-11 items-center text-teal-700">← <Bi label={T.messages} className="ml-2" /></Link>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar name={other.name} imageUrl={other.profileImageUrl} size={48} />
          <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{other.name}</h1>
          <p className="mt-1"><span className="sr-only">{other.name} </span><span className="inline-block"><CommunityRoleBadge role={other.role} nativeSpeaker={other.nativeSpeaker} /></span></p>
          </div>
        </div>
        <FollowButton userId={other.id} initial={!!follows} />
      </div>
      {!follows && <p className="rounded-xl bg-amber-50 p-3 text-amber-900"><Bi label={T.followFirst} align="start" /></p>}
      <DirectThread
        recipientId={other.id}
        canSend={!!follows}
        messages={messages.map((m) => ({ id: m.id, mine: m.senderId === me, text: m.text, createdAt: m.createdAt.toISOString(), senderName: m.sender.name, senderImageUrl: m.sender.profileImageUrl, senderRole: m.sender.role, senderNativeSpeaker: m.sender.nativeSpeaker }))}
      />
    </div>
  );
}
