"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

type ActionResult = { ok: true; groupId?: string } | { ok: false; error: string };

export async function createCommunityGroupAction(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().min(10).max(500),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Add a group name and a description of at least 10 characters." };
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== "teacher") return { ok: false, error: "Only approved teachers can create groups." };

  const group = await prisma.communityGroup.create({
    data: {
      ...parsed.data,
      ownerId: userId,
      members: { create: { userId } },
    },
    select: { id: true },
  });
  revalidatePath("/community/groups");
  return { ok: true, groupId: group.id };
}

export async function joinCommunityGroupAction(groupId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = z.string().min(1).max(60).safeParse(groupId);
  if (!parsed.success) return { ok: false, error: "This group could not be found." };
  const group = await prisma.communityGroup.findUnique({ where: { id: parsed.data }, select: { id: true } });
  if (!group) return { ok: false, error: "This group could not be found." };
  await prisma.communityGroupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId } },
    create: { groupId: group.id, userId },
    update: {},
  });
  revalidatePath(`/community/groups/${group.id}`);
  revalidatePath("/community/groups");
  return { ok: true };
}
