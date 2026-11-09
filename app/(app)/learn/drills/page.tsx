import Link from "next/link";
import { Bi } from "@/components/Bi";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { ensureContentSeeded } from "@/lib/seed";
import { T } from "@/lib/ui-text";

export default async function DrillsPage() {
  await requireUserId();
  await ensureContentSeeded();
  const drills = await prisma.listeningDrill.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, title: true, titleEnglish: true } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl"><Bi label={T.drills} align="start" /></h1>
      {drills.map((d) => (
        <Link key={d.id} href={`/learn/drills/${d.id}`} className="flex min-h-16 items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <span className="text-3xl" aria-hidden>🎧</span>
          <span className="text-xl"><Bi label={{ py: d.title, en: d.titleEnglish ?? "" }} align="start" /></span>
        </Link>
      ))}
    </div>
  );
}
