import Link from "next/link";
import { Bi } from "@/components/Bi";
import { FollowButton } from "@/components/FollowButton";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T, followerCounts } from "@/lib/ui-text";

export default async function PeoplePage() {
  const me = await requireUserId();
  // Only names are shown. Emails are never exposed.
  const people = await prisma.user.findMany({
    where: { id: { not: me } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      _count: { select: { followers: true, following: true } },
      followers: { where: { followerId: me }, select: { id: true } },
    },
  });

  return (
    <div className="space-y-4">
      <Link href="/community" className="flex min-h-11 items-center text-teal-700">← <Bi label={T.community} className="ml-2" /></Link>
      <h1 className="text-2xl"><Bi label={T.people} align="start" /></h1>
      {people.length === 0 && <p className="rounded-2xl bg-white p-6 text-center shadow-sm"><Bi label={T.noPeople} /></p>}
      {people.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold">{p.name}</p>
            <p className="text-sm text-stone-500"><Bi label={followerCounts(p._count.followers, p._count.following)} align="start" /></p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <FollowButton userId={p.id} initial={p.followers.length > 0} />
            <Link href={`/community/messages/${p.id}`} className="flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-4"><Bi label={T.message} /></Link>
          </div>
        </div>
      ))}
    </div>
  );
}
