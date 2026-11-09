"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const idSchema = z.string().min(1).max(60);
type Result = { ok: true } | { ok: false; error: string };

export async function toggleFollowAction(targetId: string): Promise<Result & { following?: boolean }> {
  const userId = await requireUserId();
  const parsed = idSchema.safeParse(targetId);
  if (!parsed.success || parsed.data === userId) return { ok: false, error: "Invalid input" };

  const target = await prisma.user.findUnique({ where: { id: parsed.data }, select: { id: true } });
  if (!target) return { ok: false, error: "Invalid input" };

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: userId, followingId: target.id } },
    select: { id: true },
  });
  if (existing) await prisma.follow.delete({ where: { id: existing.id } });
  else await prisma.follow.create({ data: { followerId: userId, followingId: target.id } });

  revalidatePath("/community/people");
  revalidatePath(`/community/messages/${target.id}`);
  return { ok: true, following: !existing };
}

const messageSchema = z.object({
  recipientId: idSchema,
  text: z
    .string()
    .trim()
    .min(1, "Type a message")
    .max(1000)
    .refine((s) => !/[\u3400-\u9fff]/.test(s), "Please type pinyin, not Chinese characters"),
});

// You can message a learner after you follow them.
export async function sendMessageAction(input: unknown): Promise<Result> {
  const userId = await requireUserId();
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success || parsed.data.recipientId === userId) {
    return { ok: false, error: parsed.success ? "Invalid input" : (parsed.error.issues[0]?.message ?? "Invalid input") };
  }
  const follows = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: userId, followingId: parsed.data.recipientId } },
    select: { id: true },
  });
  if (!follows) return { ok: false, error: "Follow this learner first" };

  await prisma.directMessage.create({ data: { senderId: userId, recipientId: parsed.data.recipientId, text: parsed.data.text } });
  revalidatePath(`/community/messages/${parsed.data.recipientId}`);
  revalidatePath("/community/messages");
  return { ok: true };
}
