import "server-only";
import prisma from "@/lib/prisma";

export async function isMistakeReportAdmin(userId: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return false;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  return user?.email.trim().toLowerCase() === adminEmail;
}
