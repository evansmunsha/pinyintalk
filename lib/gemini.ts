import "server-only";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_MAX_OUTPUT_TOKENS, GEMINI_MODEL, MEI_MAX_OUTPUT_TOKENS } from "@/lib/ai/config";

let client: GoogleGenAI | null = null;

export function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to your .env file.");
  }
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export async function generateText(prompt: string, systemInstruction?: string) {
  const response = await getClient().models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: { systemInstruction, maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS },
  });
  return response.text ?? "";
}

// Chat-style call that returns raw JSON text (Mei). Model and prompt stay on the server.
export async function generateJson(
  messages: { role: "user" | "model"; text: string }[],
  systemInstruction: string
) {
  const response = await getClient().models.generateContent({
    model: GEMINI_MODEL,
    contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    config: {
      systemInstruction,
      maxOutputTokens: MEI_MAX_OUTPUT_TOKENS,
      responseMimeType: "application/json",
    },
  });
  return response.text ?? "";
}

// Turns SDK errors into safe, readable messages (never includes the key).
export function friendlyAiError(error: unknown): { message: string; status: number } {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes("GEMINI_API_KEY is missing")) {
    return { message: "The Gemini key is missing on the server.", status: 500 };
  }
  if (/API key|API_KEY_INVALID|401|403|PERMISSION_DENIED/i.test(raw)) {
    return { message: "The Gemini key looks invalid.", status: 502 };
  }
  if (/429|quota|RESOURCE_EXHAUSTED/i.test(raw)) {
    return { message: "Gemini quota exceeded. Try again later.", status: 429 };
  }
  if (/404|NOT_FOUND/i.test(raw)) {
    return { message: "The Gemini model name was not found.", status: 502 };
  }
  if (/fetch failed|ENOTFOUND|ECONN|network/i.test(raw)) {
    return { message: "Could not reach Gemini (network problem).", status: 502 };
  }
  return { message: "Gemini request failed.", status: 502 };
}
