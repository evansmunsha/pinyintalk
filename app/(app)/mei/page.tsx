import { MeiChat } from "@/components/MeiChat";
import { LIMITS } from "@/lib/config";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function MeiPage() {
  const userId = await requireUserId();
  const day = new Date().toISOString().slice(0, 10);
  const usage = await prisma.meiUsage.findUnique({ where: { userId_day: { userId, day } } });
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Mei</h1>
      <MeiChat remainingStart={Math.max(LIMITS.meiDailyMessages - (usage?.count ?? 0), 0)} />
    </>
  );
}
