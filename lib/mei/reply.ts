import "server-only";
import { z } from "zod";
import { generateJson } from "@/lib/gemini";
import { buildMeiSystemPrompt } from "@/lib/mei/prompt";
import { stripHanzi } from "@/lib/pinyin";

const replySchema = z.object({
  pinyin: z.string(),
  speech: z.string().optional(),
  english: z.string(),
  note: z.string().default(""),
  newPhrase: z
    .object({ pinyin: z.string(), meaning: z.string(), speech: z.string().optional() })
    .nullish(),
});

// Shared by /api/mei and /api/voice/reply so every Mei reply follows the two-part rule.
export async function askMei(
  messages: { role: "user" | "model"; text: string }[],
  phrases: { pinyin: string; meaning: string }[]
) {
  const raw = await generateJson(messages, buildMeiSystemPrompt(phrases));
  const r = replySchema.parse(JSON.parse(raw));
  const english = stripHanzi(r.english);
  return {
    pinyin: stripHanzi(r.pinyin),
    speech: r.speech,
    english: /^i said/i.test(english) ? english : `I said, ${english}`,
    note: stripHanzi(r.note),
    newPhrase: r.newPhrase
      ? { pinyin: stripHanzi(r.newPhrase.pinyin), meaning: stripHanzi(r.newPhrase.meaning), speech: r.newPhrase.speech }
      : null,
  };
}
