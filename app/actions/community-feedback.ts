"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

type ActionResult = { ok: true } | { ok: false; error: string };

const feedbackSchema = z.object({
  questionId: z.string().min(1).max(60),
  rating: z.enum(["sounds_native", "almost_there", "needs_practice"]),
  comment: z.string().trim().max(300),
});

export async function submitCommunityVoiceFeedbackAction(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose a feedback rating and keep any comment under 300 characters." };

  const question = await prisma.communityQuestion.findUnique({
    where: { id: parsed.data.questionId },
    select: { id: true, userId: true, voiceNoteUrl: true, groupId: true },
  });
  if (!question?.voiceNoteUrl || question.userId === userId) return { ok: false, error: "This recording cannot receive your feedback." };
  if (question.groupId) {
    const membership = await prisma.communityGroupMember.findUnique({
      where: { groupId_userId: { groupId: question.groupId, userId } },
      select: { id: true },
    });
    if (!membership) return { ok: false, error: "Join this group before giving feedback." };
  }

  try {
    await prisma.communityVoiceFeedback.create({
      data: {
        questionId: question.id,
        userId,
        rating: parsed.data.rating,
        comment: parsed.data.comment || null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "You have already given feedback on this recording." };
    }
    console.error("[community-feedback] could not save feedback:", error);
    return { ok: false, error: "Feedback could not be saved. Please try again." };
  }
  revalidatePath("/community");
  if (question.groupId) revalidatePath(`/community/groups/${question.groupId}`);
  return { ok: true };
}

export async function reportCommunityQuestionAction(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = z.object({
    questionId: z.string().min(1).max(60),
    note: z.string().trim().max(500),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Keep the report note under 500 characters." };

  const question = await prisma.communityQuestion.findUnique({
    where: { id: parsed.data.questionId },
    select: { id: true, userId: true, groupId: true },
  });
  if (!question || question.userId === userId) return { ok: false, error: "This post cannot be reported." };
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  try {
    await prisma.$transaction(async (tx) => {
      const count = await tx.communityContentReport.count({
        where: { reporterId: userId, createdAt: { gte: todayStart } },
      });
      if (count >= 10) throw new Error("daily-limit");
      await tx.communityContentReport.create({
        data: {
          questionId: question.id,
          reporterId: userId,
          note: parsed.data.note || null,
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Error && error.message === "daily-limit") {
      return { ok: false, error: "You’ve reached today’s limit of 10 reports." };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "You have already reported this post." };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return { ok: false, error: "Your report could not be reserved. Please try again." };
    }
    console.error("[community-report] could not save report:", error);
    return { ok: false, error: "Your report could not be saved. Please try again." };
  }
  revalidatePath("/admin/community-reports");
  return { ok: true };
}

export async function reviewCommunityReportAction(
  reportId: string,
  status: "fixed" | "rejected",
): Promise<ActionResult> {
  const userId = await requireUserId();
  const { isMistakeReportAdmin } = await import("@/lib/admin");
  if (!(await isMistakeReportAdmin(userId))) return { ok: false, error: "You are not allowed to review reports." };
  const parsed = z.object({
    reportId: z.string().min(1).max(60),
    status: z.enum(["fixed", "rejected"]),
  }).safeParse({ reportId, status });
  if (!parsed.success) return { ok: false, error: "This report could not be reviewed." };
  const result = await prisma.communityContentReport.updateMany({
    where: { id: parsed.data.reportId, status: "open" },
    data: { status: parsed.data.status },
  });
  if (!result.count) return { ok: false, error: "This report was already reviewed." };
  revalidatePath("/admin/community-reports");
  return { ok: true };
}
