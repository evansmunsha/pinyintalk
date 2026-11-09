import { notFound } from "next/navigation";
import { Bi } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { ReportStatusButtons } from "@/components/ReportStatusButtons";
import { isMistakeReportAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export default async function MistakeReportsPage() {
  const userId = await requireUserId();
  if (!(await isMistakeReportAdmin(userId))) notFound();

  const reports = await prisma.mistakeReport.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl"><Bi label={{ py: "kāifāng cuòwù bàogào", en: "Open mistake reports" }} align="start" /></h1>
      {reports.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-stone-600"><Bi label={{ py: "xiànzài méiyǒu wèi chǔlǐ de bàogào.", en: "There are no open reports." }} align="start" /></p>
      ) : (
        reports.map((report) => (
          <article key={report.id} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-stone-500">{report.user.name} · {report.user.email} · {report.page}</p>
            <p className="text-xs text-stone-500">{report.createdAt.toLocaleString()}</p>
            <div className="rounded-lg bg-stone-50 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">Reported text</p>
              <Pinyin text={report.exactText} />
            </div>
            <p className="break-words">{report.note}</p>
            <ReportStatusButtons reportId={report.id} />
          </article>
        ))
      )}
    </div>
  );
}
