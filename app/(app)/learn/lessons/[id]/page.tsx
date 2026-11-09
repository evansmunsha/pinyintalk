import Link from "next/link";
import { notFound } from "next/navigation";
import { Bi } from "@/components/Bi";
import { LessonVocab } from "@/components/LessonVocab";
import type { Vocab } from "@/lib/data/lessons";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T } from "@/lib/ui-text";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUserId();
  const { id } = await params;
  const lesson = await prisma.lesson.findFirst({
    where: { id, isActive: true },
    include: { listeningDrills: { select: { id: true, title: true, titleEnglish: true } } },
  });
  if (!lesson) notFound();

  return (
    <div className="space-y-5">
      <Link href="/learn/lessons" className="flex min-h-11 items-center text-teal-700">← <Bi label={T.lessons} className="ml-2" /></Link>
      <h1 className="text-3xl"><Bi label={{ py: lesson.title, en: lesson.titleEnglish ?? "" }} align="start" /></h1>
      <p className="text-stone-700">{lesson.description}</p>
      {lesson.objectives.length > 0 && (
        <section className="rounded-2xl bg-teal-50 p-4">
          <p className="text-teal-800"><Bi label={T.objectives} align="start" /></p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-stone-700">
            {lesson.objectives.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </section>
      )}
      <h2 className="text-xl"><Bi label={T.vocabulary} align="start" /></h2>
      <LessonVocab lessonId={lesson.id} vocabulary={lesson.vocabulary as unknown as Vocab[]} />
      {lesson.listeningDrills.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl"><Bi label={T.relatedDrills} align="start" /></h2>
          {lesson.listeningDrills.map((d) => (
            <Link key={d.id} href={`/learn/drills/${d.id}`} className="block rounded-2xl bg-white p-4 shadow-sm">
              <Bi label={{ py: d.title, en: d.titleEnglish ?? "" }} align="start" />
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
