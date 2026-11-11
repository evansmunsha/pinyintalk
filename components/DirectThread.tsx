"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessageAction } from "@/app/actions/social";
import { Bi, ErrorBox } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { CommunityRoleBadge } from "@/components/CommunityRoleBadge";
import { UserAvatar } from "@/components/UserAvatar";
import { T } from "@/lib/ui-text";

export type DirectMessageDTO = {
  id: string;
  mine: boolean;
  text: string;
  createdAt: string;
  senderName: string;
  senderImageUrl: string | null;
  senderRole: string;
  senderNativeSpeaker: boolean;
};

export function DirectThread({ recipientId, messages, canSend }: { recipientId: string; messages: DirectMessageDTO[]; canSend: boolean }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  // New messages appear without leaving the page.
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 10000);
    return () => clearInterval(timer);
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await sendMessageAction({ recipientId, text });
      if (res.ok) {
        setText("");
        router.refresh();
      } else setError(res.error);
    });
  }

  return (
    <div className="flex min-h-[calc(100dvh-14rem)] flex-col md:min-h-[calc(100dvh-10rem)]">
      <div className="flex-1 space-y-2">
        {messages.length === 0 && <p className="py-6 text-center text-stone-500"><Bi label={T.noMessages} /></p>}
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[85%] break-words rounded-2xl px-4 py-2 text-lg ${m.mine ? "ml-auto bg-teal-600 text-white" : "bg-white shadow-sm"}`}>
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
              <UserAvatar name={m.senderName} imageUrl={m.senderImageUrl} size={28} />
              <span className={m.mine ? "text-white" : "text-stone-700"}>{m.senderName}</span>
              <CommunityRoleBadge role={m.senderRole} nativeSpeaker={m.senderNativeSpeaker} />
            </div>
            <Pinyin text={m.text} />
            <time dateTime={m.createdAt} suppressHydrationWarning className={`mt-1 block text-xs ${m.mine ? "text-teal-100" : "text-stone-400"}`}>
              {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </time>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {canSend && (
        <form onSubmit={submit} className="sticky bottom-16 mt-3 space-y-2 bg-stone-50 py-2 md:bottom-0">
          <ErrorBox message={error} />
          <div className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Pinyin or English…" aria-label="Message"
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 text-lg" />
            <button disabled={pending || !text.trim()} className="min-h-12 rounded-xl bg-teal-600 px-5 text-white disabled:opacity-60"><Bi label={T.send} /></button>
          </div>
        </form>
      )}
    </div>
  );
}
