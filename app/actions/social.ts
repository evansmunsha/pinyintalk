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

export async function inviteToPrivateChatAction(input: unknown): Promise<Result> {
  const userId = await requireUserId();
  const parsed = z.object({
    recipientId: idSchema,
    message: z.string().trim().min(1).max(500),
  }).safeParse(input);

  if (!parsed.success || parsed.data.recipientId === userId) {
    return { ok: false, error: "Choose a valid learner to invite." };
  }

  const recipient = await prisma.user.findUnique({
    where: { id: parsed.data.recipientId },
    select: { id: true, chatInvitesEnabled: true },
  });
  if (!recipient) return { ok: false, error: "This learner could not be found." };
  if (!recipient.chatInvitesEnabled) return { ok: false, error: "This learner is not accepting invitations right now." };

  const existing = await prisma.directMessageInvitation.findFirst({
    where: {
      OR: [
        { senderId: userId, recipientId: recipient.id, status: "pending" },
        { senderId: recipient.id, recipientId: userId, status: "pending" },
      ],
    },
    select: { id: true },
  });

  if (existing) return { ok: false, error: "An invitation is already waiting." };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sentToday = await prisma.directMessageInvitation.count({
    where: { senderId: userId, createdAt: { gte: today } },
  });

  if (sentToday >= 5) return { ok: false, error: "You can send 5 new invitations a day. Please try again tomorrow." };

  await prisma.directMessageInvitation.create({
    data: {
      senderId: userId,
      recipientId: recipient.id,
      message: parsed.data.message,
      status: "pending",
    },
  });

  revalidatePath("/community");
  revalidatePath("/community/inbox");
  return { ok: true };
}

export async function respondToPrivateChatInviteAction(input: unknown): Promise<Result> {
  const userId = await requireUserId();
  const parsed = z.object({
    invitationId: idSchema,
    accept: z.boolean(),
  }).safeParse(input);

  if (!parsed.success) return { ok: false, error: "This invitation could not be updated." };

  const invitation = await prisma.directMessageInvitation.findFirst({
    where: { id: parsed.data.invitationId, recipientId: userId, status: "pending" },
    include: { sender: { select: { id: true, name: true } }, recipient: { select: { id: true, name: true } } },
  });
  if (!invitation) return { ok: false, error: "This invitation is no longer pending." };

  await prisma.directMessageInvitation.update({
    where: { id: invitation.id },
    data: { status: parsed.data.accept ? "accepted" : "declined" },
  });

  if (parsed.data.accept) {
    await prisma.directMessage.create({
      data: {
        senderId: userId,
        recipientId: invitation.senderId,
        text: `Hi ${invitation.sender.name}! I accepted your private chat invitation.`,
      },
    });
  }

  revalidatePath("/community/inbox");
  revalidatePath(`/community/messages/${invitation.senderId}`);
  revalidatePath("/community/messages");
  return { ok: true };
}

export async function togglePrivateChatSettingsAction(enabled: boolean): Promise<Result> {
  const userId = await requireUserId();
  await prisma.user.update({ where: { id: userId }, data: { chatInvitesEnabled: enabled } });
  revalidatePath("/me");
  return { ok: true };
}

export async function blockUserAction(targetId: string): Promise<Result> {
  const userId = await requireUserId();
  const parsed = idSchema.safeParse(targetId);
  if (!parsed.success || parsed.data === userId) return { ok: false, error: "Invalid user." };

  await prisma.userBlock.upsert({
    where: { blockerId_blockedId: { blockerId: userId, blockedId: parsed.data } },
    update: {},
    create: { blockerId: userId, blockedId: parsed.data },
  });
  revalidatePath("/community/messages");
  return { ok: true };
}

export async function reportPrivateThreadAction(input: unknown): Promise<Result> {
  const userId = await requireUserId();
  const parsed = z.object({
    targetUserId: idSchema,
    note: z.string().trim().min(1).max(500),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Write a short note about the problem." };

  await prisma.userReport.create({
    data: {
      reporterId: userId,
      reportedUserId: parsed.data.targetUserId,
      note: parsed.data.note,
      status: "open",
    },
  });

  revalidatePath("/community/messages");
  return { ok: true };
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

// You can message a learner after you follow them or after an accepted private-chat invitation.
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
  const acceptedInvite = await prisma.directMessageInvitation.findFirst({
    where: {
      OR: [
        { senderId: userId, recipientId: parsed.data.recipientId, status: "accepted" },
        { senderId: parsed.data.recipientId, recipientId: userId, status: "accepted" },
      ],
    },
    select: { id: true },
  });
  if (!follows && !acceptedInvite) return { ok: false, error: "Follow this learner first or accept an invitation." };

  await prisma.directMessage.create({ data: { senderId: userId, recipientId: parsed.data.recipientId, text: parsed.data.text } });
  revalidatePath(`/community/messages/${parsed.data.recipientId}`);
  revalidatePath("/community/messages");
  return { ok: true };
}
