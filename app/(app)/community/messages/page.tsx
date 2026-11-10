import Link from "next/link";
import { Bi } from "@/components/Bi";
import { CommunityRoleBadge } from "@/components/CommunityRoleBadge";
import { Pinyin } from "@/components/Pinyin";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T } from "@/lib/ui-text";

export default async function MessagesPage() {
  const me = await requireUserId();
  // Only messages you sent or received.
  const recent = await prisma.directMessage.findMany({
    where: { OR: [{ senderId: me }, { recipientId: me }] },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      sender: { select: { id: true, name: true, role: true, nativeSpeaker: true } },
      recipient: { select: { id: true, name: true, role: true, nativeSpeaker: true } },
    },
  });

  const threads = new Map<string, { id: string; name: string; role: string; nativeSpeaker: boolean; last: string; unread: number }>();
  for (const m of recent) {
    const other = m.senderId === me ? m.recipient : m.sender;
    const t = threads.get(other.id) ?? {
      id: other.id,
      name: other.name,
      role: other.role,
      nativeSpeaker: other.nativeSpeaker,
      last: m.text,
      unread: 0,
    };
    if (m.recipientId === me && !m.readAt) t.unread += 1;
    threads.set(other.id, t);
  }

  return (
    <div className="space-y-4">
      <Link href="/community" className="flex min-h-11 items-center text-teal-700">← <Bi label={T.community} className="ml-2" /></Link>
      <h1 className="text-2xl"><Bi label={T.messages} align="start" /></h1>
      {threads.size === 0 && (
        <Link href="/community/people" className="block rounded-2xl bg-white p-6 text-center shadow-sm">
          <Bi label={T.noMessages} />
          <span className="mt-2 block text-teal-700"><Bi label={T.people} /></span>
        </Link>
      )}
      {[...threads.values()].map((t) => (
        <Link key={t.id} href={`/community/messages/${t.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <span className="min-w-0">
            <span className="block truncate text-xl font-semibold">{t.name}</span>
            <span className="block"><CommunityRoleBadge role={t.role} nativeSpeaker={t.nativeSpeaker} /></span>
            <span className="block truncate text-stone-600"><Pinyin text={t.last} /></span>
          </span>
          {t.unread > 0 && <span className="shrink-0 rounded-full bg-teal-600 px-3 py-1 text-sm text-white"><Bi label={T.newBadge} /></span>}
        </Link>
      ))}
    </div>
  );
}
