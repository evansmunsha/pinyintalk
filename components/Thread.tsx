"use client";

import { AudioClip } from "@/components/AudioClip";
import { Bi } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { ReportMistake } from "@/components/ReportMistake";
import { ToneFeedback } from "@/components/ToneFeedback";
import type { ToneFeedback as ToneFeedbackData } from "@/lib/tone-analysis";
import { T } from "@/lib/ui-text";

export type TurnDTO = {
  id: string;
  createdAt: string;
  heardPinyin: string;
  heardEnglish: string;
  toneFeedback?: ToneFeedbackData;
  replyPinyin: string;
  replyEnglish: string;
  hasLearner: boolean;
  hasZh: boolean;
  hasEn: boolean;
};

const clipUrl = (id: string, kind: "learner" | "zh" | "en") => `/api/files/${id}/${kind}`;

function Time({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} suppressHydrationWarning className="text-xs text-stone-400">
      {new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </time>
  );
}

// Chat view: the learner's voice messages on the right, Mei's replies on the left.
// Every clip plays from saved audio, so replaying never costs anything.
export function Thread({ turns, onDeleteTurn }: { turns: TurnDTO[]; onDeleteTurn?: (id: string) => void }) {
  return (
    <div className="space-y-5">
      {turns.map((t) => (
        <div key={t.id} className="space-y-3">
          <div className="ml-auto w-[90%] max-w-sm space-y-2 rounded-2xl border border-teal-200 bg-teal-50 p-3">
            {t.hasLearner ? (
              <AudioClip src={clipUrl(t.id, "learner")} label={T.you} />
            ) : (
              <p className="text-sm text-teal-700"><Bi label={T.you} align="start" /></p>
            )}
            {t.heardPinyin && <p className="break-words text-xl font-semibold"><Pinyin text={t.heardPinyin} /></p>}
            {t.heardEnglish && <p className="break-words text-sm text-stone-600">{t.heardEnglish}</p>}
            {t.toneFeedback && <ToneFeedback feedback={t.toneFeedback} />}
            <div className="text-right"><Time iso={t.createdAt} /></div>
          </div>

          <div className="w-[90%] max-w-sm space-y-2 rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-sm text-teal-700"><Bi label={T.mei} align="start" /></p>
            <p className="break-words text-2xl font-semibold"><Pinyin text={t.replyPinyin} /></p>
            <p className="break-words text-sm text-stone-600">{t.replyEnglish}</p>
            <ReportMistake exactText={`${t.replyPinyin}\n${t.replyEnglish}`} />
            {(t.hasZh || t.hasEn) && (
              <div className="grid grid-cols-2 gap-2">
                {t.hasZh && <AudioClip src={clipUrl(t.id, "zh")} label={T.chineseClip} />}
                {t.hasEn && <AudioClip src={clipUrl(t.id, "en")} label={T.englishClip} />}
              </div>
            )}
            {onDeleteTurn && (
              <button onClick={() => onDeleteTurn(t.id)} className="min-h-11 text-sm text-red-700 underline">
                <Bi label={T.deleteMessage} align="start" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
