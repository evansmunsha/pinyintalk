import { NextResponse } from "next/server";
import { z } from "zod";
import { GEMINI_LISTEN_MODEL } from "@/lib/ai/config";
import { aiErrorResponse } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import { saveAudio } from "@/lib/storage";
import { bumpMeiUsage, meiRemaining } from "@/lib/usage";
import { talk } from "@/lib/voice";
import { voiceAllowed, voiceUserId } from "@/lib/voiceAuth";

const MAX_BYTES = 2 * 1024 * 1024; // 15 seconds of 16kHz mono WAV is under 500KB

const historySchema = z
  .array(z.object({ role: z.enum(["user", "model"]), text: z.string().trim().min(1).max(400) }))
  .max(8);

// Listen AND reply in one Gemini call (faster than two). The page then plays the speech clips.
// With save=1 and a signed-in user, the turn and the learner's recording are saved to the conversation.
export async function POST(request: Request) {
  if (!(await voiceAllowed())) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const started = Date.now();

  const form = await request.formData().catch(() => null);
  const file = form?.get("audio");
  let rawHistory: unknown = [];
  try {
    rawHistory = JSON.parse(String(form?.get("history") ?? "[]"));
  } catch {
    rawHistory = null;
  }
  const history = historySchema.safeParse(rawHistory);
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_BYTES || file.type !== "audio/wav" || !history.success) {
    return NextResponse.json({ error: "Invalid recording." }, { status: 400 });
  }

  const userId = form?.get("save") === "1" ? await voiceUserId() : null;
  const conversationIdInput = String(form?.get("conversationId") ?? "");
  if (userId && (await meiRemaining(userId)) <= 0) {
    return NextResponse.json({ error: "You've used all of today's messages with Mei. Come back tomorrow!" }, { status: 429 });
  }

  try {
    const audio = Buffer.from(await file.arrayBuffer());
    const result = await talk(audio.toString("base64"), history.data);
    console.log(`[timing] /api/voice/listen total: ${Date.now() - started}ms`);
    if (!result) {
      return NextResponse.json(
        { error: "Gemini heard no clear speech in that recording. Speak a little louder and closer, then try again." },
        { status: 422 }
      );
    }
    if (!userId) return NextResponse.json(result);

    // Save the turn. A failure here must not break the conversation itself.
    try {
      let conversationId = conversationIdInput;
      if (conversationId) {
        const owned = await prisma.conversation.findFirst({ where: { id: conversationId, userId }, select: { id: true } });
        if (!owned) return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });
      } else {
        conversationId = (await prisma.conversation.create({ data: { userId }, select: { id: true } })).id;
      }
      const turn = await prisma.conversationTurn.create({
        data: {
          conversationId,
          userId,
          heardPinyin: result.heard.pinyin,
          heardEnglish: result.heard.english,
          replyPinyin: result.reply.pinyin,
          replyEnglish: result.reply.english,
          replySpeech: result.reply.speech ?? null,
        },
        select: { id: true, createdAt: true },
      });
      const learnerAudioPath = await saveAudio(`${userId}/${conversationId}/${turn.id}-learner.wav`, audio);
      await prisma.conversationTurn.update({ where: { id: turn.id }, data: { learnerAudioPath } });
      await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
      const remaining = await bumpMeiUsage(userId);
      return NextResponse.json({ ...result, turnId: turn.id, conversationId, createdAt: turn.createdAt, remaining });
    } catch (error) {
      console.error("[conversation] could not save turn:", error instanceof Error ? error.message : error);
      return NextResponse.json({ ...result, saveFailed: true });
    }
  } catch (error) {
    return aiErrorResponse("voice/listen", GEMINI_LISTEN_MODEL, error);
  }
}
