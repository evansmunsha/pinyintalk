import "server-only";
import { z } from "zod";
import { GEMINI_MODEL } from "@/lib/ai/config";
import { MEI_REPLY_SCHEMA } from "@/lib/ai/schemas";
import { generateJson } from "@/lib/gemini";
import { buildMeiSystemPrompt } from "@/lib/mei/prompt";
import { stripHanzi } from "@/lib/pinyin";

const replySchema = z.object({
  pinyin: z.string(),
  speech: z.string().optional(),
  english: z.string(),
  note: z.string().optional().default(""),
  newPhrase: z
    .object({ pinyin: z.string(), meaning: z.string(), speech: z.string().optional() })
    .nullish(),
});

// Shared by /api/mei and /api/voice/reply so every Mei reply follows the two-part rule.
// Structured output should always be valid; if parsing still fails we retry once.
export async function askMei(
  messages: { role: "user" | "model"; text: string }[],
  phrases: { pinyin: string; meaning: string }[]
) {
  let r: z.infer<typeof replySchema> | null = null;
  let lastRaw = "";
  for (let attempt = 1; attempt <= 2 && !r; attempt++) {
    lastRaw = await generateJson(messages, buildMeiSystemPrompt(phrases), MEI_REPLY_SCHEMA);
    try {
      r = replySchema.parse(JSON.parse(lastRaw.replace(/^```(?:json)?\s*|\s*```$/g, "")));
    } catch {
      console.error(`[gemini] Mei reply unreadable (attempt ${attempt}) | model=${GEMINI_MODEL} | raw=${lastRaw.slice(0, 300)}`);
    }
  }
  if (!r) {
    throw new Error(`Mei's answer was not valid JSON after 2 tries. Raw start: ${lastRaw.slice(0, 120) || "(empty)"}`);
  }
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
