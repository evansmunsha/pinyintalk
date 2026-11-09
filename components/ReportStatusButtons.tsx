"use client";

import { useState, useTransition } from "react";
import { updateMistakeReportStatus } from "@/app/actions/mistake-reports";
import { Bi } from "@/components/Bi";

export function ReportStatusButtons({ reportId }: { reportId: string }) {
  const [error, setError] = useState<{ py: string; en: string } | null>(null);
  const [pending, start] = useTransition();

  function update(status: "fixed" | "rejected") {
    setError(null);
    start(async () => {
      const result = await updateMistakeReportStatus(reportId, status);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={pending} onClick={() => update("fixed")} className="min-h-11 rounded-xl bg-emerald-700 px-3 text-white disabled:opacity-60">
          <Bi label={{ py: "yǐ xiūfù", en: "Mark fixed" }} />
        </button>
        <button type="button" disabled={pending} onClick={() => update("rejected")} className="min-h-11 rounded-xl border border-red-300 px-3 text-red-800 disabled:opacity-60">
          <Bi label={{ py: "bù cǎinà", en: "Reject" }} />
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-red-800"><Bi label={error} align="start" /></p>}
    </div>
  );
}
