import { notFound } from "next/navigation";
import { Bi } from "@/components/Bi";
import { CommunityReportReviewButtons } from "@/components/CommunityReportReviewButtons";
import { Pinyin } from "@/components/Pinyin";
import { isMistakeReportAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function CommunityReportsPage() {
  const userId = await requireUserId();
  if (!(await isMistakeReportAdmin(userId))) notFound();
  const reports = await prisma.communityContentReport.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "asc" },
    include: {
      reporter: { select: { name: true, role: true, nativeSpeaker: true } },
      question: { select: { id: true, text: true, meaning: true, user: { select: { name: true } } } },
    },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl"><Bi label={{ py: "dàjiā de bàogào", en: "Community post reports" }} align="start" /></h1>
      {reports.length === 0 && <p className="rounded-xl bg-white p-4"><Bi label={{ py: "méiyǒu kāifàng de bàogào.", en: "No open reports." }} align="start" /></p>}
      {reports.map((report) => (
        <article key={report.id} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-500">{report.reporter.name} · {report.createdAt.toLocaleString()}</p>
          <p><Bi label={{ py: `bàogào tiězi: ${report.question.user.name}`, en: "Reported post" }} align="start" /></p>
          <p className="font-medium"><Pinyin text={report.question.text} /></p>
          {report.question.meaning && <p>{report.question.meaning}</p>}
          {report.note && <p className="whitespace-pre-wrap rounded-lg bg-stone-50 p-3">{report.note}</p>}
          <CommunityReportReviewButtons reportId={report.id} />
        </article>
      ))}
    </div>
  );
}
