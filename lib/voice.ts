import "server-only";
import { createHash } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_LISTEN_MODEL, GEMINI_TTS_MODEL, VOICES } from "@/lib/ai/config";
import { getClient } from "@/lib/gemini";

export type SpeakLang = "zh" | "en";

const cache = new Map<string, Buffer>();
const CACHE_MAX = 200;

// Gemini TTS returns raw 24kHz 16-bit mono PCM in some paths; make sure we always send a WAV.
function ensureWav(buf: Buffer): Buffer {
  if (buf.subarray(0, 4).toString("ascii") === "RIFF") return buf;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + buf.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(24000, 24);
  header.writeUInt32LE(48000, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(buf.length, 40);
  return Buffer.concat([header, buf]);
}

// Each language part is sent separately with its own voice and style, so the model never guesses.
export async function synthesize(text: string, lang: SpeakLang, slow: boolean): Promise<Buffer> {
  const key = createHash("sha1").update(`${lang}|${slow}|${text}`).digest("hex");
  const hit = cache.get(key);
  if (hit) return hit;

  const style =
    lang === "zh"
      ? `Speak in clear, natural Mandarin Chinese (Putonghua) with correct tones${slow ? ", slowly and carefully" : ""}`
      : `Speak in clear, friendly English${slow ? ", slowly" : ""}`;

  const client: GoogleGenAI = getClient();
  const interaction = await client.interactions.create({
    model: GEMINI_TTS_MODEL,
    input: [
      {
        type: "user_input",
        content: [{ type: "text", text, annotations: [{ type: "speech_metadata", style }] }],
      },
    ],
    response_format: { type: "audio" },
    generation_config: { speech_config: [{ voice: VOICES[lang] }] },
  } as never) as unknown as { output_audio?: { data?: string } };

  const data = interaction.output_audio?.data;
  if (!data) throw new Error("No audio returned");
  const wav = ensureWav(Buffer.from(data, "base64"));

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(key, wav);
  return wav;
}

export type Heard = { pinyin: string; english: string };

// Gemini understands the Mandarin audio and answers in pinyin with tone marks plus English.
export async function transcribe(audioBase64: string, mimeType: string): Promise<Heard | null> {
  const response = await getClient().models.generateContent({
    model: GEMINI_LISTEN_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: audioBase64, mimeType } },
          {
            text:
              'The learner is speaking Mandarin Chinese. Write what they said in pinyin with tone marks (never Chinese characters) and its English meaning. If there is no clear speech, return {"pinyin": "", "english": ""}. Answer ONLY with JSON: {"pinyin": string, "english": string}',
          },
        ],
      },
    ],
    config: { responseMimeType: "application/json", maxOutputTokens: 300 },
  });
  const parsed = JSON.parse(response.text ?? "{}") as Partial<Heard>;
  if (!parsed.pinyin?.trim()) return null;
  return { pinyin: parsed.pinyin.trim(), english: (parsed.english ?? "").trim() };
}
