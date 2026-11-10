"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewTeacherApplicationAction } from "@/app/actions/community-roles";
import { Bi } from "@/components/Bi";

export function TeacherApplicationReviewButtons({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  function decide(status: "approved" | "rejected") {
    setError("");
    start(async () => {
      const result = await reviewTeacherApplicationAction(applicationId, status);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={pending} onClick={() => decide("approved")} className="min-h-11 rounded-xl bg-emerald-700 text-white disabled:opacity-60">
          <Bi label={{ py: "pīzhǔn", en: "Approve" }} />
        </button>
        <button type="button" disabled={pending} onClick={() => decide("rejected")} className="min-h-11 rounded-xl bg-stone-700 text-white disabled:opacity-60">
          <Bi label={{ py: "jùjué", en: "Reject" }} />
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
