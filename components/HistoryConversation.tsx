"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteConversationAction, deleteTurnAction } from "@/app/actions/conversations";
import { Bi, ErrorBox } from "@/components/Bi";
import { Thread, type TurnDTO } from "@/components/Thread";
import { CONFIRM_DELETE_CONVERSATION, CONFIRM_DELETE_MESSAGE, T } from "@/lib/ui-text";

// A saved conversation: chat view with replay, plus continue and delete.
export function HistoryConversation({ id, turns }: { id: string; turns: TurnDTO[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function removeTurn(turnId: string) {
    if (!confirm(CONFIRM_DELETE_MESSAGE)) return;
    start(async () => {
      const res = await deleteTurnAction(turnId);
      if (!res.ok) return setError(res.error);
      if (res.conversationDeleted) router.replace("/history");
      else router.refresh();
    });
  }

  function removeConversation() {
    if (!confirm(CONFIRM_DELETE_CONVERSATION)) return;
    start(async () => {
      const res = await deleteConversationAction(id);
      if (!res.ok) return setError(res.error);
      router.replace("/history");
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">
        <Link href={`/mei?c=${id}`} className="flex min-h-12 items-center justify-center rounded-xl bg-teal-600 px-2 text-center text-white">
          <Bi label={T.continueConversation} />
        </Link>
        <button onClick={removeConversation} disabled={pending} className="min-h-12 rounded-xl border border-red-200 bg-white px-2 text-red-700 disabled:opacity-60">
          <Bi label={T.deleteConversation} />
        </button>
      </div>
      <ErrorBox message={error} />
      <Thread turns={turns} onDeleteTurn={removeTurn} />
    </div>
  );
}
