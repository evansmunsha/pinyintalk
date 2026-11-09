import type { TurnDTO } from "@/components/Thread";

type TurnRow = {
  id: string;
  createdAt: Date;
  heardPinyin: string;
  heardEnglish: string;
  replyPinyin: string;
  replyEnglish: string;
  learnerAudioPath: string | null;
  replyZhAudioPath: string | null;
  replyEnAudioPath: string | null;
};

// Database row -> what the browser needs (file paths stay on the server).
export function toTurnDTO(t: TurnRow): TurnDTO {
  return {
    id: t.id,
    createdAt: t.createdAt.toISOString(),
    heardPinyin: t.heardPinyin,
    heardEnglish: t.heardEnglish,
    replyPinyin: t.replyPinyin,
    replyEnglish: t.replyEnglish,
    hasLearner: !!t.learnerAudioPath,
    hasZh: !!t.replyZhAudioPath,
    hasEn: !!t.replyEnAudioPath,
  };
}
