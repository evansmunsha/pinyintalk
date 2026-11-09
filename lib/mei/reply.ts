import "server-only";
import { z } from "zod";
import { GEMINI_MODEL } from "@/lib/ai/config";
import { MEI_REPLY_SCHEMA } from "@/lib/ai/schemas";
import { generateJson } from "@/lib/gemini";
import { buildMeiSystemPrompt } from "@/lib/mei/prompt";
import { correctBuToneSandhi, stripHanzi, toneNumbersToMarks } from "@/lib/pinyin";

const replySchema = z.object({
  pinyin: z.string(),
  speech: z.string().optional(),
  english: z.string(),
  note: z.string().trim().min(1).max(120),
  newPhrase: z
    .object({ pinyin: z.string(), meaning: z.string(), speech: z.string().optional() })
    .nullish(),
});

// Shared by /api/mei and /api/voice/reply so every Mei reply follows the two-part rule.
// Structured output should always be valid; if parsing still fails we retry once.
export async function askMei(
  messages: { role: "user" | "model"; text: string }[],
  phrases: { pinyin: string; meaning: string }[],
  learnerName = "friend"
) {
  const lastMessage = messages.at(-1)?.text ?? "";
  if (/\b(?:what(?:'s| is)|tell me|do you know)\s+(?:my|the learner'?s)\s+name\b/i.test(lastMessage)) {
    return {
      pinyin: correctBuToneSandhi(`nǐ jiào ${learnerName}`),
      speech: `你叫${learnerName}`,
      english: `I said, your name is ${learnerName}.`,
      note: `"Nǐ jiào" means "your name is".`,
      newPhrase: null,
    };
  }

  let r: z.infer<typeof replySchema> | null = null;
  let lastRaw = "";
  const normalizedMessages = messages.map((message) => ({
    ...message,
    text: message.role === "user" ? toneNumbersToMarks(message.text) : message.text,
  }));
  for (let attempt = 1; attempt <= 2 && !r; attempt++) {
    lastRaw = await generateJson(normalizedMessages, buildMeiSystemPrompt(phrases, learnerName), MEI_REPLY_SCHEMA);
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
    pinyin: correctBuToneSandhi(stripHanzi(r.pinyin)),
    speech: r.speech,
    english: /^i said/i.test(english) ? english : `I said, ${english}`,
    note: stripHanzi(r.note),
    newPhrase: r.newPhrase
      ? {
          pinyin: correctBuToneSandhi(stripHanzi(r.newPhrase.pinyin)),
          meaning: stripHanzi(r.newPhrase.meaning),
          speech: r.newPhrase.speech,
        }
      : null,
  };
}
