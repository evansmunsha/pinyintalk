import { NextResponse } from "next/server";
import { z } from "zod";
import { GEMINI_TTS_MODEL } from "@/lib/ai/config";
import { aiErrorResponse } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import { saveAudio } from "@/lib/storage";
import { synthesize } from "@/lib/voice";
import { voiceAllowed, voiceUserId } from "@/lib/voiceAuth";

const bodySchema = z.object({
  text: z.string().trim().min(1).max(300),
  lang: z.enum(["zh", "en"]).default("zh"),
  slow: z.boolean().default(false),
  // When set, the normal-speed clip is also saved to this conversation turn (owner only).
  turnId: z.string().min(1).max(60).optional(),
});

export async function POST(request: Request) {
  if (!(await voiceAllowed())) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid text." }, { status: 400 });

  try {
    const wav = await synthesize(parsed.data.text, parsed.data.lang, parsed.data.slow);

    if (parsed.data.turnId && !parsed.data.slow) {
      try {
        const userId = await voiceUserId();
        const turn = userId
          ? await prisma.conversationTurn.findFirst({ where: { id: parsed.data.turnId, userId }, select: { id: true, conversationId: true } })
          : null;
        if (userId && turn) {
          const part = parsed.data.lang;
          const saved = await saveAudio(`${userId}/${turn.conversationId}/${turn.id}-${part}.wav`, wav);
          await prisma.conversationTurn.update({
            where: { id: turn.id },
            data: part === "zh" ? { replyZhAudioPath: saved } : { replyEnAudioPath: saved },
          });
        }
      } catch (error) {
        console.error("[conversation] could not save clip:", error instanceof Error ? error.message : error);
      }
    }

    return new Response(new Uint8Array(wav), {
      headers: { "Content-Type": "audio/wav", "Cache-Control": "private, max-age=86400" },
    });
  } catch (error) {
    return aiErrorResponse("voice/speak", GEMINI_TTS_MODEL, error);
  }
}
