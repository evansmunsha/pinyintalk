"use client";

import { useTransition } from "react";
import { respondToPrivateChatInviteAction } from "@/app/actions/social";
import { Bi } from "@/components/Bi";

export function PrivateChatInviteActions({ invitationId }: { invitationId: string }) {
  const [pending, start] = useTransition();

  function respond(accept: boolean) {
    start(async () => {
      await respondToPrivateChatInviteAction({ invitationId, accept });
    });
  }

  return (
    <div className="flex gap-2">
      <button type="button" disabled={pending} onClick={() => respond(true)} className="min-h-11 rounded-xl bg-teal-700 px-4 text-white disabled:opacity-60">
        <Bi label={{ py: "jiēshòu", en: "Accept" }} />
      </button>
      <button type="button" disabled={pending} onClick={() => respond(false)} className="min-h-11 rounded-xl border border-stone-300 bg-white px-4 disabled:opacity-60">
        <Bi label={{ py: "jùjué", en: "Decline" }} />
      </button>
    </div>
  );
}
