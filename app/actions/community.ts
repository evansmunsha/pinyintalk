"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const questionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(3, "Type your question")
    .max(500)
    .refine((s) => !/[\u3400-\u9fff]/.test(s), "Please type pinyin, not Chinese characters"),
  level: z.enum(["beginner", "tones", "travel"]),
});

export async function postQuestionAction(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUserId();
  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  await prisma.communityQuestion.create({ data: { userId, text: parsed.data.text, level: parsed.data.level } });
  revalidatePath("/community");
  return { ok: true };
}
