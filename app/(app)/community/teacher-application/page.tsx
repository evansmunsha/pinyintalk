import Link from "next/link";
import { Bi } from "@/components/Bi";
import { TeacherApplicationForm } from "@/components/TeacherApplicationForm";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function TeacherApplicationPage() {
  const userId = await requireUserId();
  const [user, application] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.teacherApplication.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { status: true } }),
  ]);
  const status = user?.role === "teacher" ? "approved" : application?.status;
  return (
    <div className="space-y-4">
      <Link href="/community" className="flex min-h-11 items-center text-teal-700">← <Bi label={{ py: "dàjiā de xuéxí shèqū", en: "Community" }} className="ml-2" /></Link>
      <h1 className="text-2xl"><Bi label={{ py: "shēnqǐng chéngwéi lǎoshī", en: "Apply to become a teacher" }} align="start" /></h1>
      <TeacherApplicationForm initialStatus={status ?? undefined} />
    </div>
  );
}
