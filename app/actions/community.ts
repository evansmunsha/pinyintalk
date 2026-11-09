"use server";

import { revalidatePath } from "next/cache";
import { communityQuestionSchema } from "@/lib/community-schemas";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function postQuestionAction(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUserId();
  const parsed = communityQuestionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  await prisma.communityQuestion.create({ data: { userId, text: parsed.data.text, level: parsed.data.level } });
  revalidatePath("/community");
  return { ok: true };
}
