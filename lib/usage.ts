import "server-only";
import prisma from "@/lib/prisma";
import { LIMITS } from "@/lib/config";

const today = () => new Date().toISOString().slice(0, 10);

// Daily Mei message limit (shared by text chat and voice conversations).
export async function meiRemaining(userId: string): Promise<number> {
  const usage = await prisma.meiUsage.findUnique({ where: { userId_day: { userId, day: today() } } });
  return Math.max(LIMITS.meiDailyMessages - (usage?.count ?? 0), 0);
}

export async function bumpMeiUsage(userId: string): Promise<number> {
  const updated = await prisma.meiUsage.upsert({
    where: { userId_day: { userId, day: today() } },
    create: { userId, day: today(), count: 1 },
    update: { count: { increment: 1 } },
  });
  return Math.max(LIMITS.meiDailyMessages - updated.count, 0);
}
