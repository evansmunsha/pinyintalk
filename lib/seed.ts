import "server-only";
import prisma from "@/lib/prisma";
import { DRILLS, LESSONS } from "@/lib/data/lessons";

// Saves lessons and drills from lib/data/lessons.ts into the database the first time they are needed.
// Safe to call on every visit: it only adds what is missing.
export async function ensureContentSeeded() {
  const lessonCount = await prisma.lesson.count();
  if (lessonCount >= LESSONS.length) return;

  const ids = new Map<string, string>();
  for (const l of LESSONS) {
    const existing = await prisma.lesson.findFirst({ where: { title: l.title, theme: l.theme }, select: { id: true } });
    const lesson =
      existing ??
      (await prisma.lesson.create({
        data: {
          title: l.title,
          titleEnglish: l.titleEnglish,
          titleChinese: l.titleChinese,
          theme: l.theme,
          description: l.description,
          level: l.level,
          objectives: l.objectives,
          vocabulary: l.vocabulary,
          order: l.order,
          isActive: l.isActive,
        },
        select: { id: true },
      }));
    ids.set(l.key, lesson.id);
  }

  for (const d of DRILLS) {
    const exists = await prisma.listeningDrill.findFirst({ where: { title: d.title, titleEnglish: d.titleEnglish }, select: { id: true } });
    if (exists) continue;
    await prisma.listeningDrill.create({
      data: {
        lessonId: ids.get(d.lessonKey) ?? null,
        title: d.title,
        titleEnglish: d.titleEnglish,
        titleChinese: d.titleChinese,
        transcript: d.transcript,
        transcriptPinyin: d.transcriptPinyin,
        level: d.level,
        questions: {
          create: d.questions.map((q, i) => ({ text: q.text, options: q.options, correctAnswer: q.correctAnswer, order: i })),
        },
      },
    });
  }
}
