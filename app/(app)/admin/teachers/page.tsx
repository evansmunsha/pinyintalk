import { notFound } from "next/navigation";
import { Bi } from "@/components/Bi";
import { TeacherApplicationReviewButtons } from "@/components/TeacherApplicationReviewButtons";
import { isMistakeReportAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function TeacherApplicationsPage() {
  const userId = await requireUserId();
  if (!(await isMistakeReportAdmin(userId))) notFound();
  const applications = await prisma.teacherApplication.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true, role: true } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl"><Bi label={{ py: "lǎoshī shēnqǐng", en: "Teacher applications" }} align="start" /></h1>
      {applications.length === 0 && <p className="rounded-xl bg-white p-4"><Bi label={{ py: "méiyǒu děngdài shěnchá de shēnqǐng.", en: "No pending applications." }} align="start" /></p>}
      {applications.map((application) => (
        <article key={application.id} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-semibold">{application.user.name} · {application.user.email}</p>
          <p className="whitespace-pre-wrap">{application.note}</p>
          <p className="text-xs text-stone-500">{application.createdAt.toLocaleString()}</p>
          <TeacherApplicationReviewButtons applicationId={application.id} />
        </article>
      ))}
    </div>
  );
}
