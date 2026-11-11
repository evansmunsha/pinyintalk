"use client";

import { useState, useTransition } from "react";
import { inviteToPrivateChatAction } from "@/app/actions/social";
import { Bi } from "@/components/Bi";

export function PrivateChatInviteButton({ userId, label }: { userId: string; label?: { py: string; en: string } }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function invite() {
    setError("");
    start(async () => {
      const result = await inviteToPrivateChatAction({ recipientId: userId, message: "Hi! Can we chat privately?" });
      if (result.ok) setSent(true);
      else setError(result.error);
    });
  }

  return (
    <div className="space-y-1">
      <button type="button" onClick={invite} disabled={pending || sent}
        className="min-h-11 rounded-full border border-teal-600 bg-white px-4 text-sm text-teal-800 disabled:opacity-60">
        <Bi label={label ?? { py: "sīxiàng liáotiān", en: "Chat privately" }} />
      </button>
      {sent && <p className="text-xs text-emerald-700"><Bi label={{ py: "yǐ fā chū yāoqǐng", en: "Invitation sent" }} align="start" /></p>}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
