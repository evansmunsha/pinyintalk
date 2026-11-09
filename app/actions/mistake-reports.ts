"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isMistakeReportAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const reportSchema = z.object({
  exactText: z.string().trim().min(1).max(1000),
  page: z.string().trim().min(1).max(300).refine((value) => value.startsWith("/") && !value.startsWith("//")),
  note: z.string().trim().min(3).max(500),
});

export type MistakeReportResult =
  | { ok: true }
  | { ok: false; error: { py: string; en: string } };

const todayStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export async function submitMistakeReport(input: unknown): Promise<MistakeReportResult> {
  const userId = await requireUserId();
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { py: "qǐng jiǎnchá nǐ de bàogào.", en: "Please check your report and try again." } };
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const count = await tx.mistakeReport.count({
        where: { userId, createdAt: { gte: todayStart() } },
      });
      if (count >= 10) return false;

      await tx.mistakeReport.create({
        data: { userId, exactText: parsed.data.exactText, page: parsed.data.page, note: parsed.data.note },
      });
      return true;
    }, { isolationLevel: "Serializable" });

    if (!created) {
      return { ok: false, error: { py: "nǐ jīntiān yǐjīng fā le shí tiáo bàogào.", en: "You’ve reached today’s limit of 10 reports." } };
    }

    revalidatePath("/admin/reports");
    return { ok: true };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2034") {
      return { ok: false, error: { py: "nǐ jīntiān yǐjīng fā le shí tiáo bàogào.", en: "You’ve reached today’s limit of 10 reports." } };
    }
    console.error("[mistake-report] could not save report:", error);
    return { ok: false, error: { py: "bàogào wèi néng bǎocún.", en: "Your report could not be saved. Please try again." } };
  }
}

export async function updateMistakeReportStatus(
  reportId: string,
  status: "fixed" | "rejected"
): Promise<MistakeReportResult> {
  const userId = await requireUserId();
  if (!(await isMistakeReportAdmin(userId))) {
    return { ok: false, error: { py: "wúquán cāozuò.", en: "You are not allowed to do that." } };
  }

  const parsed = z.object({
    reportId: z.string().min(1).max(60),
    status: z.enum(["fixed", "rejected"]),
  }).safeParse({ reportId, status });
  if (!parsed.success) {
    return { ok: false, error: { py: "wúxiào de bàogào.", en: "Invalid report." } };
  }

  const result = await prisma.mistakeReport.updateMany({
    where: { id: parsed.data.reportId, status: "open" },
    data: { status: parsed.data.status },
  });
  if (result.count === 0) {
    return { ok: false, error: { py: "bàogào yǐjīng gēngxīn huò wèi zhǎodào.", en: "Report was already updated or not found." } };
  }

  revalidatePath("/admin/reports");
  return { ok: true };
}
