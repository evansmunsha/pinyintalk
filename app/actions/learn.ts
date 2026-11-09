"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { detectHints } from "@/lib/hints";
import type { Vocab } from "@/lib/data/lessons";

const idSchema = z.string().min(1).max(60);

// Adds every phrase of a lesson to the learner's own phrase list (skips ones they already have).
export async function addLessonPhrasesAction(lessonId: string): Promise<{ ok: true; added: number } | { ok: false; error: string }> {
  const userId = await requireUserId();
  const parsed = idSchema.safeParse(lessonId);
  if (!parsed.success) return { ok: false, error: "Invalid lesson" };

  const lesson = await prisma.lesson.findFirst({ where: { id: parsed.data, isActive: true }, select: { vocabulary: true } });
  if (!lesson) return { ok: false, error: "Invalid lesson" };

  const vocab = lesson.vocabulary as unknown as Vocab[];
  const have = new Set(
    (await prisma.phrase.findMany({ where: { userId }, select: { pinyin: true } })).map((p) => p.pinyin.toLowerCase())
  );
  const fresh = vocab.filter((v) => !have.has(v.pinyin.toLowerCase()));
  if (fresh.length) {
    await prisma.phrase.createMany({
      data: fresh.map((v) => ({
        userId,
        pinyin: v.pinyin,
        meaning: v.meaning,
        speechText: v.speech,
        hintKey: detectHints(v.pinyin)[0]?.key ?? null,
      })),
    });
  }
  revalidatePath("/phrases");
  revalidatePath("/dashboard");
  return { ok: true, added: fresh.length };
}

const submitSchema = z.object({
  drillId: idSchema,
  answers: z.array(z.number().int().min(-1).max(10)).min(1).max(20),
});

export type DrillResult = {
  score: number;
  total: number;
  transcriptPinyin: string;
  results: { questionId: string; selected: number; correctAnswer: number; isCorrect: boolean }[];
};

// Checks the answers on the server (correct answers are never sent to the browser before this) and saves them.
export async function submitDrillAction(input: unknown): Promise<{ ok: true; result: DrillResult } | { ok: false; error: string }> {
  const userId = await requireUserId();
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid answers" };

  const drill = await prisma.listeningDrill.findUnique({
    where: { id: parsed.data.drillId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!drill || drill.questions.length !== parsed.data.answers.length) return { ok: false, error: "Invalid answers" };

  const results = drill.questions.map((q, i) => {
    const selected = parsed.data.answers[i];
    return { questionId: q.id, selected, correctAnswer: q.correctAnswer, isCorrect: selected === q.correctAnswer };
  });
  const score = results.filter((r) => r.isCorrect).length;

  const session = await prisma.session.create({
    data: {
      userId,
      lessonId: drill.lessonId,
      mode: "listen",
      status: "completed",
      completedAt: new Date(),
      questionsAnswered: results.length,
      correctAnswers: score,
    },
    select: { id: true },
  });
  await prisma.answer.createMany({
    data: results.map((r) => ({
      sessionId: session.id,
      questionId: r.questionId,
      userId,
      selectedOption: r.selected,
      isCorrect: r.isCorrect,
    })),
  });
  return { ok: true, result: { score, total: results.length, transcriptPinyin: drill.transcriptPinyin, results } };
}
