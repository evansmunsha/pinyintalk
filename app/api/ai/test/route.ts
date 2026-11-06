import { NextResponse } from "next/server";
import { friendlyAiError, generateText } from "@/lib/gemini";

const PROMPT =
  "You are Mei, a friendly Mandarin tutor. Reply to the learner saying nǐ hǎo. Answer in pinyin only, with tone marks, then give the English meaning on a new line. Keep it under 30 words.";

export async function POST() {
  try {
    const reply = await generateText(PROMPT);
    return NextResponse.json({ reply });
  } catch (error) {
    const { message, status } = friendlyAiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
