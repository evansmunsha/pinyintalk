import Link from "next/link";
import { AskQuestion } from "@/components/AskQuestion";
import { Bi } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { T, type Label } from "@/lib/ui-text";

const LEVEL_LABEL: Record<string, Label> = { beginner: T.beginner, tones: T.tones, travel: T.travel };

export default async function CommunityPage() {
  await requireUserId();
  const questions = await prisma.communityQuestion.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { user: { select: { name: true } }, responses: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl"><Bi label={T.community} align="start" /></h1>
      <div className="grid grid-cols-2 gap-2">
        <Link href="/community/people" className="flex min-h-12 items-center justify-center rounded-xl bg-white shadow-sm"><Bi label={T.people} /></Link>
        <Link href="/community/messages" className="flex min-h-12 items-center justify-center rounded-xl bg-white shadow-sm"><Bi label={T.messages} /></Link>
      </div>
      <AskQuestion />
      {questions.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <Bi label={T.noQuestions} />
          <p className="mt-2 text-teal-700"><Bi label={T.beFirst} /></p>
        </div>
      ) : (
        questions.map((q) => (
          <article key={q.id} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 text-sm text-stone-500">
              <span>{q.user.name}</span>
              <span className="rounded-full bg-stone-100 px-3 py-1"><Bi label={LEVEL_LABEL[q.level] ?? T.beginner} /></span>
            </div>
            <p className="break-words text-xl font-semibold"><Pinyin text={q.text} /></p>
            {q.responses.length === 0 ? (
              <p className="text-stone-500"><Bi label={T.waitingTeacher} align="start" /></p>
            ) : (
              q.responses.map((r) => (
                <div key={r.id} className="rounded-xl bg-teal-50 p-3">
                  <p className="text-teal-800"><Bi label={T.teacherReply} align="start" /></p>
                  <p className="mt-1 break-words">{r.text}</p>
                  {r.examplePinyin && <p className="mt-1 break-words text-xl font-semibold"><Pinyin text={r.examplePinyin} /></p>}
                </div>
              ))
            )}
          </article>
        ))
      )}
    </div>
  );
}
