"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { deleteAudio } from "@/lib/storage";
import { requireUserId } from "@/lib/session";

const idSchema = z.string().min(1).max(60);

type Result = { ok: true; conversationDeleted?: boolean } | { ok: false; error: string };

// Delete one conversation (and every recording in it). Only the owner can do this.
export async function deleteConversationAction(id: string): Promise<Result> {
  const userId = await requireUserId();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid conversation" };

  const conversation = await prisma.conversation.findFirst({
    where: { id: parsed.data, userId },
    include: { turns: { select: { learnerAudioPath: true, replyZhAudioPath: true, replyEnAudioPath: true } } },
  });
  if (!conversation) return { ok: false, error: "Invalid conversation" };

  for (const t of conversation.turns) {
    await Promise.all([deleteAudio(t.learnerAudioPath), deleteAudio(t.replyZhAudioPath), deleteAudio(t.replyEnAudioPath)]);
  }
  await prisma.conversation.delete({ where: { id: conversation.id } });
  revalidatePath("/history");
  return { ok: true, conversationDeleted: true };
}

// Delete one message (the learner's recording and Mei's reply). An empty conversation is removed too.
export async function deleteTurnAction(id: string): Promise<Result> {
  const userId = await requireUserId();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid message" };

  const turn = await prisma.conversationTurn.findFirst({ where: { id: parsed.data, userId } });
  if (!turn) return { ok: false, error: "Invalid message" };

  await Promise.all([deleteAudio(turn.learnerAudioPath), deleteAudio(turn.replyZhAudioPath), deleteAudio(turn.replyEnAudioPath)]);
  await prisma.conversationTurn.delete({ where: { id: turn.id } });

  const left = await prisma.conversationTurn.count({ where: { conversationId: turn.conversationId } });
  if (left === 0) await prisma.conversation.delete({ where: { id: turn.conversationId } });
  revalidatePath("/history");
  return { ok: true, conversationDeleted: left === 0 };
}
