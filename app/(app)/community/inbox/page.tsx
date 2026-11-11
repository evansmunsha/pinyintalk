import Link from "next/link";
import { Bi } from "@/components/Bi";
import { CommunityRoleBadge } from "@/components/CommunityRoleBadge";
import { PrivateChatInviteActions } from "@/components/PrivateChatInviteActions";
import { PrivateChatSettingsToggle } from "@/components/PrivateChatSettingsToggle";
import { Pinyin } from "@/components/Pinyin";
import { UserAvatar } from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function CommunityInboxPage() {
  const userId = await requireUserId();

  const [user, pendingInvites, acceptedInvites] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { chatInvitesEnabled: true },
    }),
    prisma.directMessageInvitation.findMany({
      where: { recipientId: userId, status: "pending" },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, profileImageUrl: true, role: true, nativeSpeaker: true } },
      },
    }),
    prisma.directMessageInvitation.findMany({
      where: { OR: [{ senderId: userId, status: "accepted" }, { recipientId: userId, status: "accepted" }] },
      orderBy: { updatedAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, profileImageUrl: true, role: true, nativeSpeaker: true } },
        recipient: { select: { id: true, name: true, profileImageUrl: true, role: true, nativeSpeaker: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-5">
      <Link href="/community" className="flex min-h-11 items-center text-teal-700">← <Bi label={{ py: "shèqū", en: "Community" }} className="ml-2" /></Link>
      <h1 className="text-2xl"><Bi label={{ py: "xìnxiǎn", en: "Inbox" }} align="start" /></h1>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <PrivateChatSettingsToggle initial={user?.chatInvitesEnabled ?? true} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold"><Bi label={{ py: "dāi chǔlǐ de yāoqǐng", en: "Pending invitations" }} align="start" /></h2>
        {pendingInvites.length === 0 ? (
          <div className="rounded-2xl bg-white p-4 text-stone-600 shadow-sm">
            <Bi label={{ py: "méiyǒu xīn de yāoqǐng", en: "No new invitations" }} align="start" />
          </div>
        ) : (
          pendingInvites.map((invitation) => (
            <article key={invitation.id} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <UserAvatar name={invitation.sender.name} imageUrl={invitation.sender.profileImageUrl} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-stone-800">{invitation.sender.name}</span>
                    <CommunityRoleBadge role={invitation.sender.role} nativeSpeaker={invitation.sender.nativeSpeaker} />
                  </div>
                  <div className="mt-1 text-sm text-stone-600"><Pinyin text={invitation.message} /></div>
                </div>
              </div>
              <PrivateChatInviteActions invitationId={invitation.id} />
            </article>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold"><Bi label={{ py: "yǐ jiēshòu de liáotiān", en: "Accepted chats" }} align="start" /></h2>
        {acceptedInvites.length === 0 ? (
          <div className="rounded-2xl bg-white p-4 text-stone-600 shadow-sm">
            <Bi label={{ py: "hái méi yǒu de liáotiān", en: "No active private chats yet" }} align="start" />
          </div>
        ) : (
          acceptedInvites.map((invitation) => {
            const other = invitation.senderId === userId ? invitation.recipient : invitation.sender;
            return (
              <Link key={invitation.id} href={`/community/messages/${other.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar name={other.name} imageUrl={other.profileImageUrl} size={38} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-stone-800">{other.name}</span>
                      <CommunityRoleBadge role={other.role} nativeSpeaker={other.nativeSpeaker} />
                    </div>
                    <p className="truncate text-sm text-stone-600"><Pinyin text={invitation.message} /></p>
                  </div>
                </div>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-900"><Bi label={{ py: "kāi huìtán", en: "Open" }} /></span>
              </Link>
            );
          })
        )}
      </section>
    </div>
  );
}
