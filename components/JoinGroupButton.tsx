"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinCommunityGroupAction } from "@/app/actions/community-groups";
import { Bi } from "@/components/Bi";

export function JoinGroupButton({ groupId, isMember }: { groupId: string; isMember: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  if (isMember) return <p className="text-sm text-teal-800"><Bi label={{ py: "nǐ yǐ jiārù", en: "You joined this group" }} align="start" /></p>;
  return (
    <div>
      <button type="button" disabled={pending} onClick={() => start(async () => {
        const result = await joinCommunityGroupAction(groupId);
        if (result.ok) router.refresh();
        else setError(result.error);
      })} className="min-h-11 rounded-xl bg-teal-700 px-5 text-white disabled:opacity-60">
        <Bi label={{ py: pending ? "zhèngzài jiārù" : "jiārù xiǎozǔ", en: pending ? "Joining…" : "Join group" }} />
      </button>
      {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}
