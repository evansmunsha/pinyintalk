import { HINTS, type Hint } from "@/lib/data/hints";
import { normalizePinyin } from "@/lib/pinyin";

const TIME_WORDS = ["jintian", "mingtian", "zuotian", "meitian", "xianzai", "zaoshang", "wanshang"];
const QUESTION_WORDS = ["shenme", "nage", "nali", "weishenme", "zenme"];

// Simple keyword matching on normalised pinyin (tone marks ignored).
export function detectHints(pinyin: string): Hint[] {
  const text = normalizePinyin(pinyin);
  if (!text) return [];
  const tokens = text.split(" ");
  const has = (word: string) => tokens.includes(word);
  const hasTime = TIME_WORDS.some(has);
  const hasQuestion = QUESTION_WORDS.some(has);
  const found: Hint[] = [];

  if (tokens[tokens.length - 1] === "ma") found.push(HINTS.ma);
  if (has("bu")) found.push(HINTS.bu);
  if (has("meiyou")) found.push(HINTS.meiyou);
  if (hasQuestion) found.push(HINTS.questionWords);
  if (hasTime && hasQuestion) found.push(HINTS.timeQuestion);
  if (hasTime || has("zai")) found.push(HINTS.wordOrder);
  return found;
}
