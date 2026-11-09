import "server-only";
import { createHash } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_LISTEN_MODEL, GEMINI_TTS_MODEL, TALK_MAX_OUTPUT_TOKENS, VOICES } from "@/lib/ai/config";
import { TALK_SCHEMA } from "@/lib/ai/schemas";
import { FAST_THINKING, getClient } from "@/lib/gemini";
import { stripHanzi } from "@/lib/pinyin";
import { readAudio, saveAudio } from "@/lib/storage";
import { toneFeedbackSchema } from "@/lib/tone-analysis";

export type SpeakLang = "zh" | "en";

// Survives dev hot-reloads. Also remembers requests still in progress so two identical
// requests (for example a warm-up and a real one) share one Gemini call.
const g = globalThis as unknown as { __ttsCache?: Map<string, Buffer>; __ttsPending?: Map<string, Promise<Buffer>> };
const cache = (g.__ttsCache ??= new Map<string, Buffer>());
const pending = (g.__ttsPending ??= new Map<string, Promise<Buffer>>());
const CACHE_MAX = 500;

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
// Uses the fastest TTS model (see GEMINI_TTS_MODEL in lib/ai/config.ts).
export async function synthesize(text: string, lang: SpeakLang, slow: boolean): Promise<Buffer> {
  const key = createHash("sha1").update(`${GEMINI_TTS_MODEL}|${lang}|${slow}|${text}`).digest("hex");
  const hit = cache.get(key);
  if (hit) {
    console.log(`[timing] tts ${lang}: cache hit`);
    return hit;
  }
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const job = loadOrGenerateSpeech(text, lang, slow, key).finally(() => pending.delete(key));
  pending.set(key, job);
  return job;
}

function remember(key: string, wav: Buffer) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(key, wav);
}

async function loadOrGenerateSpeech(text: string, lang: SpeakLang, slow: boolean, key: string): Promise<Buffer> {
  const path = `tts/${key}.wav`;
  const stored = await readAudio(path);
  if (stored) {
    remember(key, stored);
    console.log(`[timing] tts ${lang}: disk cache hit`);
    return stored;
  }

  const wav = await generateSpeech(text, lang, slow);
  await saveAudio(path, wav);
  remember(key, wav);
  return wav;
}

async function generateSpeech(text: string, lang: SpeakLang, slow: boolean): Promise<Buffer> {
  const started = Date.now();

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

  console.log(`[timing] tts ${lang}: ${Date.now() - started}ms (${GEMINI_TTS_MODEL})`);
  return wav;
}

export type Heard = { pinyin: string; english: string };

export type Talked = {
  heard: Heard;
  reply: { pinyin: string; speech?: string; english: string };
  toneFeedback: {
    summary: string;
    syllables: { pinyin: string; status: "clear" | "practice" | "unclear"; tip: string }[];
  };
};

const TALK_SYSTEM = `You are Mei, a friendly Mandarin partner talking with a learner. The audio is the learner speaking Mandarin.
1. "heard": what they said, in pinyin with tone marks (never Chinese characters) plus a short English meaning. If there is no clear speech, use empty strings.
2. "toneFeedback": assess the tones you can hear in the learner's recording. Return one entry for each recognized syllable in order, using the syllable from "heard.pinyin" with its tone mark. Mark "clear" when the tone is clear, "practice" only when a tone error is audible, and "unclear" when you cannot judge confidently. Do not penalize natural third-tone sandhi. Give a short, specific English cue for "practice"; use an empty tip otherwise. If speech is unclear, return no syllables and explain briefly in "summary". This is an estimate, not a precise acoustic measurement.
3. "reply": your very short, natural Mandarin answer (max 6 words) in pinyin with tone marks, "speech" = the same sentence in Chinese characters (audio only, never shown), and "english" = "I said," then the meaning in as few words as possible, as if explaining your own sentence. Never reply with only one part.
Answer ONLY with JSON in the given schema.`;

// One Gemini call does both listening and replying (faster than two calls).
// Structured output keeps the JSON complete; if parsing still fails we retry once.
export async function talk(
  audioBase64: string,
  history: { role: "user" | "model"; text: string }[]
): Promise<Talked | null> {
  let parsed: Partial<Talked> | null = null;
  let raw = "";
  for (let attempt = 1; attempt <= 2 && !parsed; attempt++) {
    const started = Date.now();
    const response = await getClient().models.generateContent({
      model: GEMINI_LISTEN_MODEL,
      contents: [
        ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: "user", parts: [{ inlineData: { data: audioBase64, mimeType: "audio/wav" } }] },
      ],
      config: {
        systemInstruction: TALK_SYSTEM,
        responseMimeType: "application/json",
        responseJsonSchema: TALK_SCHEMA,
        maxOutputTokens: TALK_MAX_OUTPUT_TOKENS,
        thinkingConfig: FAST_THINKING,
      },
    });
    console.log(`[timing] gemini talk: ${Date.now() - started}ms (${GEMINI_LISTEN_MODEL}, attempt ${attempt})`);
    raw = (response.text ?? "").replace(/^```(?:json)?\s*|\s*```$/g, "");
    try {
      parsed = JSON.parse(raw) as Partial<Talked>;
    } catch {
      console.error(`[gemini] talk unreadable (attempt ${attempt}) | raw=${raw.slice(0, 300)}`);
    }
  }
  if (!parsed) throw new Error(`Gemini answer was not valid JSON after 2 tries. Raw start: ${raw.slice(0, 120) || "(empty)"}`);
  const heard = parsed.heard;
  const reply = parsed.reply;
  if (!heard?.pinyin?.trim() || !reply?.pinyin?.trim()) return null;
  const toneFeedback = toneFeedbackSchema.parse(parsed.toneFeedback);
  const english = (reply.english ?? "").trim();
  return {
    heard: { pinyin: stripHanzi(heard.pinyin), english: stripHanzi(heard.english ?? "") },
    reply: {
      pinyin: stripHanzi(reply.pinyin),
      speech: reply.speech,
      english: /^i said/i.test(english) ? stripHanzi(english) : `I said, ${stripHanzi(english)}`,
    },
    toneFeedback: {
      summary: stripHanzi(toneFeedback.summary),
      syllables: toneFeedback.syllables.map((item) => ({
        ...item,
        pinyin: stripHanzi(item.pinyin),
        tip: stripHanzi(item.tip),
      })),
    },
  };
}

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
    config: { responseMimeType: "application/json", maxOutputTokens: 200, thinkingConfig: FAST_THINKING },
  });
  let parsed: Partial<Heard> = {};
  try {
    parsed = JSON.parse(response.text ?? "{}") as Partial<Heard>;
  } catch {
    throw new Error("Gemini returned an unreadable answer for the recording.");
  }
  if (!parsed.pinyin?.trim()) return null;
  return { pinyin: parsed.pinyin.trim(), english: (parsed.english ?? "").trim() };
}
