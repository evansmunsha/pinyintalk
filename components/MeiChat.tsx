"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { addPhraseAction } from "@/app/actions/phrases";
import { Bi, ErrorBox } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { ReportMistake } from "@/components/ReportMistake";
import { ToneKeyboard } from "@/components/ToneKeyboard";
import type { TurnDTO } from "@/components/Thread";
import { useMeiVoice, type Part } from "@/lib/useMeiVoice";
import type { MeiReply } from "@/lib/types";
import { T, messagesLeft } from "@/lib/ui-text";
import { insertToneAtCursor } from "@/lib/pinyin";

type Msg = { role: "user" | "model"; text: string; reply?: MeiReply; turnId?: string; added?: boolean; help?: boolean };
type MeiResponse = { reply: MeiReply; remaining: number; conversationId: string; turnId: string };

function messagesFromTurns(turns: TurnDTO[]): Msg[] {
  return turns.flatMap((turn) => [
    { role: "user" as const, text: turn.heardPinyin },
    {
      role: "model" as const,
      text: turn.replyPinyin,
      reply: {
        pinyin: turn.replyPinyin,
        english: turn.replyEnglish,
        note: "Read the pinyin aloud; the English line explains Mei's Mandarin reply.",
      },
      turnId: turn.id,
    },
  ]);
}

// Mandarin first, then the English explanation ("I said, ...") unless the learner turned it off.
function partsFor(reply: MeiReply, englishAfter: boolean, turnId?: string): Part[] {
  const parts: Part[] = [{ text: reply.pinyin, lang: "zh", speechText: reply.speech, turnId }];
  if (englishAfter) parts.push({ text: reply.english, lang: "en", turnId });
  return parts;
}

export function MeiChat({
  initialTurns,
  initialConversationId,
  remainingStart,
  englishAfter = true,
}: {
  initialTurns: TurnDTO[];
  initialConversationId: string | null;
  remainingStart: number;
  englishAfter?: boolean;
}) {
  const [msgs, setMsgs] = useState<Msg[]>(() => messagesFromTurns(initialTurns));
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(remainingStart);
  const voice = useMeiVoice();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function insertAtCursor(inserted: string) {
    const inputElement = inputRef.current;
    const start = inputElement?.selectionStart ?? input.length;
    const end = inputElement?.selectionEnd ?? start;
    const insertion = insertToneAtCursor(input, start, end, inserted);
    setInput(insertion.text);
    requestAnimationFrame(() => inputElement?.setSelectionRange(insertion.cursor, insertion.cursor));
  }

  function backspaceAtCursor() {
    const inputElement = inputRef.current;
    const start = inputElement?.selectionStart ?? input.length;
    const end = inputElement?.selectionEnd ?? start;
    if (start === 0 && end === 0) return;
    const from = start === end ? start - 1 : start;
    const next = `${input.slice(0, from)}${input.slice(end)}`;
    setInput(next);
    requestAnimationFrame(() => inputElement?.setSelectionRange(from, from));
  }

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...msgs, { role: "user", text }];
    setMsgs(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/mei", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-10).map((m) => ({ role: m.role, text: m.reply ? `${m.reply.pinyin}\n${m.reply.english}` : m.text })),
          ...(conversationId ? { conversationId } : {}),
        }),
      });
      const data = (await res.json()) as MeiResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        if (typeof data.remaining === "number") setRemaining(data.remaining);
      } else {
        setConversationId(data.conversationId);
        window.history.replaceState(null, "", `/mei?mode=type&c=${encodeURIComponent(data.conversationId)}`);
        setMsgs([...next, { role: "model", text: data.reply.pinyin, reply: data.reply, turnId: data.turnId }]);
        setRemaining(data.remaining);
        // Mei's replies play automatically.
        voice.play(partsFor(data.reply, englishAfter, data.turnId));
      }
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  async function addNew(i: number) {
    const np = msgs[i].reply?.newPhrase;
    if (!np) return;
    const res = await addPhraseAction({ pinyin: np.pinyin, meaning: np.meaning, speechText: np.speech });
    if (!res.ok && !res.error.includes("already")) return setError(res.error);
    setMsgs((m) => m.map((x, j) => (j === i ? { ...x, added: true } : x)));
  }

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-col md:min-h-[calc(100dvh-4rem)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-stone-500"><Bi label={messagesLeft(remaining)} align="start" /></p>
        <Link href="/mei?mode=type" className="flex min-h-11 items-center rounded-full border border-stone-300 bg-white px-4 text-sm text-stone-800">
          <Bi label={{ py: "xīn duìhuà", en: "New chat" }} />
        </Link>
      </div>
      <div className="flex-1 space-y-3">
        {!msgs.length && (
          <div className="rounded-2xl bg-white p-4 text-lg text-stone-700">
            <Bi label={T.chatIntro} align="start" />
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => send("nǐ hǎo")} className="min-h-11 rounded-full border border-stone-300 px-4">
                <Bi label={{ py: "nǐ hǎo", en: "hello" }} />
              </button>
              <button onClick={() => send("how do I say goodbye?")} className="min-h-11 rounded-full border border-stone-300 px-4">
                <Bi label={T.howSayGoodbye} />
              </button>
            </div>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] break-words rounded-2xl bg-teal-100 px-4 py-3 text-lg text-stone-900"><Pinyin text={m.text} /></div>
          ) : (
            <div key={i} className="max-w-[90%] space-y-2 rounded-2xl bg-white p-4 shadow-sm">
              <p className="break-words text-2xl font-semibold"><Pinyin text={m.reply?.pinyin ?? ""} /></p>
              <p className="text-sm text-stone-600">{m.reply?.english}</p>
              <ReportMistake exactText={[
                m.reply?.pinyin,
                m.reply?.english,
                m.reply?.note,
                m.reply?.newPhrase?.pinyin,
                m.reply?.newPhrase?.meaning,
              ].filter(Boolean).join("\n")} />
              {m.reply && (
                <p id={`mei-help-${i}`} hidden={!m.help} className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900" role="status">
                  {m.reply.note || "Read the pinyin aloud; the English line explains Mei's Mandarin reply."}
                </p>
              )}
              {m.reply?.newPhrase && (
                <div className="rounded-lg bg-teal-50 p-2">
                  <p className="text-sm text-teal-800"><Bi label={T.newPhrase} align="start" /></p>
                  <p className="text-lg font-semibold"><Pinyin text={m.reply.newPhrase.pinyin} /></p>
                  <p className="text-sm text-stone-600">{m.reply.newPhrase.meaning}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => m.reply && voice.play(partsFor(m.reply, englishAfter, m.turnId))} className="min-h-11 rounded-full border border-stone-300 px-4">
                  ▶ <Bi label={T.play} className="inline-flex" />
                </button>
                {m.reply?.newPhrase && (
                  <button disabled={m.added} onClick={() => addNew(i)} className="min-h-11 rounded-full border border-teal-300 px-4 text-teal-800 disabled:opacity-60">
                    <Bi label={m.added ? T.added : T.addToPhrases} />
                  </button>
                )}
                <button
                  type="button"
                  aria-expanded={!!m.help}
                  aria-controls={`mei-help-${i}`}
                  onClick={() => setMsgs((x) => x.map((y, j) => (j === i ? { ...y, help: !y.help } : y)))}
                  className="min-h-11 rounded-full border border-stone-300 px-4"
                >
                  <Bi label={m.help ? { py: "yǐncáng yīngwén bāngzhù", en: "Hide English help" } : T.helpEnglish} />
                </button>
              </div>
            </div>
          )
        )}
        {loading && (
          <div className="flex w-fit items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm" role="status">
            <Bi label={T.thinking} align="start" />
            <span className="flex gap-1" aria-hidden>
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-2.5 w-2.5 animate-bounce rounded-full bg-teal-600" style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
          </div>
        )}
        <ErrorBox message={error} />
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="sticky bottom-16 mt-3 flex flex-col gap-2 bg-stone-50 py-2 md:bottom-0">
        <div className="flex gap-2">
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder="Pinyin or English…"
            aria-label="Message Mei" className="min-h-12 min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 text-lg" />
          <button disabled={loading || remaining <= 0} className="min-h-12 rounded-xl bg-teal-600 px-5 text-white disabled:opacity-60"><Bi label={T.send} /></button>
        </div>
        <ToneKeyboard onInsert={insertAtCursor} onBackspace={backspaceAtCursor} />
      </form>
    </div>
  );
}
