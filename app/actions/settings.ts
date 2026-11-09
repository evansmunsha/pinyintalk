"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function setEnglishAfterAction(value: boolean) {
  const userId = await requireUserId();
  const parsed = z.boolean().safeParse(value);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  await prisma.user.update({ where: { id: userId }, data: { englishAfterChinese: parsed.data } });
  revalidatePath("/me");
  return { ok: true as const };
}
