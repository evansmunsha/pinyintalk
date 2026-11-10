"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { isMistakeReportAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateCommunityProfileAction(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = z.object({
    role: z.enum(["beginner", "learner", "advanced"]),
    nativeSpeaker: z.boolean(),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please choose a valid community role." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return { ok: false, error: "Your account could not be found." };
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        nativeSpeaker: parsed.data.nativeSpeaker,
        ...(user.role === "teacher" ? {} : { role: parsed.data.role }),
      },
    });
  } catch (error) {
    console.error("[community-profile] could not update profile:", error);
    return { ok: false, error: "Your community profile could not be saved." };
  }
  revalidatePath("/me");
  revalidatePath("/community");
  revalidatePath("/community/people");
  return { ok: true };
}

export async function applyForTeacherAction(note: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = z.string().trim().min(20).max(1000).safeParse(note);
  if (!parsed.success) return { ok: false, error: "Please write 20 to 1,000 characters about your teaching experience." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role === "teacher") return { ok: false, error: "Your account cannot submit this application." };
  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.teacherApplication.findFirst({
        where: { userId, status: { in: ["pending", "approved"] } },
        select: { id: true },
      });
      if (existing) return false;
      await tx.teacherApplication.create({ data: { userId, note: parsed.data } });
      return true;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (!result) return { ok: false, error: "You already have an active or approved application." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return { ok: false, error: "Your application could not be submitted right now. Please try again." };
    }
    console.error("[teacher-application] could not save application:", error);
    return { ok: false, error: "Your application could not be saved." };
  }
  revalidatePath("/community/teacher-application");
  revalidatePath("/admin/teachers");
  return { ok: true };
}

export async function reviewTeacherApplicationAction(
  applicationId: string,
  status: "approved" | "rejected",
): Promise<ActionResult> {
  const adminId = await requireUserId();
  if (!(await isMistakeReportAdmin(adminId))) return { ok: false, error: "You are not allowed to review applications." };
  const parsed = z.object({
    applicationId: z.string().min(1).max(60),
    status: z.enum(["approved", "rejected"]),
  }).safeParse({ applicationId, status });
  if (!parsed.success) return { ok: false, error: "This application could not be reviewed." };

  const result = await prisma.$transaction(async (tx) => {
    const application = await tx.teacherApplication.findFirst({
      where: { id: parsed.data.applicationId, status: "pending" },
      select: { userId: true },
    });
    if (!application) return false;
    const update = await tx.teacherApplication.updateMany({
      where: { id: parsed.data.applicationId, status: "pending" },
      data: { status: parsed.data.status, reviewerId: adminId, reviewedAt: new Date() },
    });
    if (!update.count) return false;
    if (parsed.data.status === "approved") {
      await tx.user.update({ where: { id: application.userId }, data: { role: "teacher", isTeacher: true } });
    }
    return true;
  });
  if (!result) return { ok: false, error: "This application was already reviewed." };

  revalidatePath("/admin/teachers");
  revalidatePath("/community/teacher-application");
  revalidatePath("/community");
  return { ok: true };
}
