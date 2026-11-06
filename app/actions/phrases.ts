"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { detectHints } from "@/lib/hints";
import { nextSchedule } from "@/lib/srs";
import { HANZI_ONLY } from "@/lib/pinyin";

const hasHanzi = (s: string) => /[\u3400-\u9fff]/.test(s);

const phraseSchema = z.object({
  pinyin: z.string().trim().min(1, "Type the phrase in pinyin").max(120)
    .refine((s) => !hasHanzi(s), "Please type pinyin, not Chinese characters"),
  meaning: z.string().trim().min(1, "Add the meaning").max(200),
  note: z.string().trim().max(300).optional(),
  speechText: z.string().trim().max(80).regex(HANZI_ONLY).optional(),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

function hintKeyFor(pinyin: string) {
  return detectHints(pinyin)[0]?.key ?? null;
}

export async function addPhraseAction(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = phraseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  const exists = await prisma.phrase.findFirst({
    where: { userId, pinyin: { equals: d.pinyin, mode: "insensitive" } },
    select: { id: true },
  });
  if (exists) return { ok: false, error: "You already have this phrase" };

  await prisma.phrase.create({
    data: {
      userId,
      pinyin: d.pinyin,
      meaning: d.meaning,
      note: d.note || null,
      speechText: d.speechText || null,
      hintKey: hintKeyFor(d.pinyin),
    },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updatePhraseAction(id: string, input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = phraseSchema.omit({ speechText: true }).safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;
  await prisma.phrase.updateMany({
    where: { id, userId },
    data: { pinyin: d.pinyin, meaning: d.meaning, note: d.note || null, hintKey: hintKeyFor(d.pinyin) },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deletePhraseAction(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = z.string().min(1).safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid phrase" };
  await prisma.phrase.deleteMany({ where: { id: parsed.data, userId } });
  revalidatePath("/", "layout");
  return { ok: true };
}

// Called after each review answer. Wrong answers come back in 1 day.
export async function recordAnswerAction(id: string, correct: boolean): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = z.object({ id: z.string().min(1), correct: z.boolean() }).safeParse({ id, correct });
  if (!parsed.success) return { ok: false, error: "Invalid answer" };

  const phrase = await prisma.phrase.findFirst({ where: { id: parsed.data.id, userId } });
  if (!phrase) return { ok: false, error: "Phrase not found" };

  const { intervalDays, nextReviewAt } = nextSchedule(correct, phrase.intervalDays);
  await prisma.phrase.update({
    where: { id: phrase.id },
    data: {
      intervalDays,
      nextReviewAt,
      correctCount: { increment: correct ? 1 : 0 },
      wrongCount: { increment: correct ? 0 : 1 },
    },
  });
  return { ok: true };
}
