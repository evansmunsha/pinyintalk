import Link from "next/link";
import { Bi } from "@/components/Bi";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { ensureContentSeeded } from "@/lib/seed";
import { T } from "@/lib/ui-text";

export default async function LessonsPage() {
  await requireUserId();
  await ensureContentSeeded();
  const lessons = await prisma.lesson.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl"><Bi label={T.lessons} align="start" /></h1>
      {lessons.length === 0 && <p className="rounded-2xl bg-white p-6 text-center shadow-sm"><Bi label={T.noLessons} /></p>}
      {lessons.map((l) => (
        <Link key={l.id} href={`/learn/lessons/${l.id}`} className="block rounded-2xl bg-white p-4 shadow-sm">
          <span className="block text-2xl"><Bi label={{ py: l.title, en: l.titleEnglish ?? "" }} align="start" /></span>
        </Link>
      ))}
    </div>
  );
}
