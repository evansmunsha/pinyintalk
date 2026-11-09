import Link from "next/link";
import { notFound } from "next/navigation";
import { Bi } from "@/components/Bi";
import { DrillPlayer } from "@/components/DrillPlayer";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T } from "@/lib/ui-text";

export default async function DrillPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUserId();
  const { id } = await params;
  const drill = await prisma.listeningDrill.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!drill) notFound();

  return (
    <div className="space-y-5">
      <Link href="/learn/drills" className="flex min-h-11 items-center text-teal-700">← <Bi label={T.drills} className="ml-2" /></Link>
      <h1 className="text-3xl"><Bi label={{ py: drill.title, en: drill.titleEnglish ?? "" }} align="start" /></h1>
      {/* The correct answers and the pinyin transcript are only sent after the answers are submitted. */}
      <DrillPlayer
        drillId={drill.id}
        speech={drill.transcript}
        questions={drill.questions.map((q) => ({ id: q.id, text: q.text, options: q.options }))}
      />
    </div>
  );
}
