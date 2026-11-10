"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { communityQuestionSchema } from "@/lib/community-schemas";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const dayStartUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export async function postQuestionAction(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUserId();
  const parsed = communityQuestionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (parsed.data.groupId) {
        const membership = await tx.communityGroupMember.findUnique({
          where: { groupId_userId: { groupId: parsed.data.groupId, userId } },
          select: { id: true },
        });
        if (!membership) return "not-member" as const;
      }

      const count = await tx.communityQuestion.count({ where: { userId, createdAt: { gte: dayStartUtc() } } });
      if (count >= 10) return "limit" as const;

      await tx.communityQuestion.create({
        data: {
          userId,
          text: parsed.data.text,
          level: parsed.data.level,
          groupId: parsed.data.groupId ?? null,
        },
      });
      return "created" as const;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (result === "limit") return { ok: false, error: "You’ve reached today’s limit of 10 community posts." };
    if (result === "not-member") return { ok: false, error: "Join this group before posting." };
    revalidatePath("/community");
    if (parsed.data.groupId) revalidatePath(`/community/groups/${parsed.data.groupId}`);
    return { ok: true };
  } catch (error) {
    console.error("[community] could not post question:", error);
    return { ok: false, error: "Could not post your question. Please try again." };
  }
}
