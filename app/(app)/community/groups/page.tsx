import Link from "next/link";
import { Bi } from "@/components/Bi";
import { CommunityGroupForm } from "@/components/CommunityGroupForm";
import { JoinGroupButton } from "@/components/JoinGroupButton";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function CommunityGroupsPage() {
  const userId = await requireUserId();
  const [user, groups] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.communityGroup.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        owner: { select: { name: true, role: true, nativeSpeaker: true } },
        members: { where: { userId }, select: { id: true } },
        _count: { select: { members: true, posts: true } },
      },
    }),
  ]);
  return (
    <div className="space-y-4">
      <Link href="/community" className="flex min-h-11 items-center text-teal-700">← <Bi label={{ py: "dàjiā de xuéxí shèqū", en: "Community" }} className="ml-2" /></Link>
      <h1 className="text-2xl"><Bi label={{ py: "xuéxí xiǎozǔ", en: "Learning groups" }} align="start" /></h1>
      {user?.role === "teacher" && <CommunityGroupForm />}
      {groups.length === 0 && <p className="rounded-2xl bg-white p-4"><Bi label={{ py: "xiànzài hái méiyǒu xiǎozǔ.", en: "There are no groups yet." }} align="start" /></p>}
      {groups.map((group) => (
        <article key={group.id} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <Link href={`/community/groups/${group.id}`} className="block">
            <h2 className="text-xl font-semibold">{group.name}</h2>
            <p className="mt-1 text-stone-700">{group.description}</p>
            <p className="mt-2 text-sm text-stone-500">
              <Bi label={{ py: `lǎoshī ${group.owner.name}`, en: `${group._count.members} members · ${group._count.posts} posts` }} align="start" />
            </p>
          </Link>
          <JoinGroupButton groupId={group.id} isMember={group.members.length > 0} />
        </article>
      ))}
    </div>
  );
}
