import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { GEMINI_TTS_MODEL } from "@/lib/ai/config";
import { aiErrorResponse } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import { rateLimitWindow } from "@/lib/rate-limit";
import { readAudio, saveAudio } from "@/lib/storage";
import { speechCacheKey, speechCachePath, synthesize } from "@/lib/voice";
import { voiceAllowed, voiceUserId } from "@/lib/voiceAuth";

const bodySchema = z.object({
  text: z.string().trim().min(1).max(300),
  lang: z.enum(["zh", "en"]).default("zh"),
  // Kept for older clients. Slow playback is applied in the browser to the saved clip.
  slow: z.boolean().default(false),
  turnId: z.string().min(1).max(60).optional(),
});

const CACHE_WAIT_MS = 60_000;
const GENERATION_LEASE_MS = 5 * 60_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class VoiceUsageError extends Error {}

function cachedAudioResponse(wav: Buffer, cacheHit: boolean) {
  return new Response(new Uint8Array(wav), {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "private, max-age=86400",
      "X-Voice-Cache": cacheHit ? "hit" : "generated",
    },
  });
}

function isCompleteWav(data: Buffer) {
  return data.length >= 12 &&
    data.toString("ascii", 0, 4) === "RIFF" &&
    data.toString("ascii", 8, 12) === "WAVE" &&
    data.readUInt32LE(4) + 8 === data.length;
}

export async function POST(request: Request) {
  if (!(await voiceAllowed())) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const ipKey = request.headers.get("x-forwarded-for") ?? "local";
  const speechRateLimit = rateLimitWindow(`voice-speak:${ipKey}`, 20, 60_000);
  if (!speechRateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many voice requests. Please try again in a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(speechRateLimit.resetMs / 1000)) } }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid text." }, { status: 400 });

  const { text, lang, turnId } = parsed.data;
  const userId = turnId ? await voiceUserId() : null;
  if (turnId && !userId) return NextResponse.json({ error: "Please sign in to save this clip." }, { status: 401 });

  const turn = turnId && userId
    ? await prisma.conversationTurn.findFirst({
        where: { id: turnId, userId },
        select: { id: true },
      })
    : null;
  if (turnId && !turn) return NextResponse.json({ error: "Conversation turn not found." }, { status: 404 });

  const cacheKey = speechCacheKey(text, lang, false);
  const audioPath = speechCachePath(text, lang, false);
  const attachToTurn = async () => {
    if (!turn) return;
    await prisma.conversationTurn.update({
      where: { id: turn.id },
      data: lang === "zh" ? { replyZhAudioPath: audioPath } : { replyEnAudioPath: audioPath },
    });
  };
  const startedWaiting = Date.now();
  let clipId: string | null = null;
  let ownsGeneration = false;

  while (!ownsGeneration) {
    const savedAudio = await readAudio(audioPath);
    if (savedAudio && isCompleteWav(savedAudio)) {
      await prisma.speechClip.upsert({
        where: { cacheKey },
        create: { cacheKey, text, lang, audioPath, status: "ready" },
        update: { audioPath, status: "ready" },
      });
      await attachToTurn();
      console.log("[voice] saved clip used");
      return cachedAudioResponse(savedAudio, true);
    }

    let clip = await prisma.speechClip.findUnique({ where: { cacheKey } });
    if (!clip) {
      try {
        clip = await prisma.speechClip.create({
          data: { cacheKey, text, lang, status: "generating" },
        });
        ownsGeneration = true;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
        throw error;
      }
    } else {
      const staleBefore = new Date(Date.now() - GENERATION_LEASE_MS);
      const canClaim = clip.status === "failed" || clip.status === "ready" || clip.updatedAt < staleBefore;
      if (canClaim) {
        const claim = await prisma.speechClip.updateMany({
          where: {
            id: clip.id,
            OR: [
              { status: "failed" },
              { status: "ready" },
              { status: "generating", updatedAt: { lt: staleBefore } },
            ],
          },
          data: { status: "generating", audioPath: null },
        });
        if (claim.count > 0) ownsGeneration = true;
      }
    }

    if (ownsGeneration) {
      clipId = clip.id;
      break;
    }
    if (Date.now() - startedWaiting >= CACHE_WAIT_MS) {
      return NextResponse.json(
        { error: "This voice clip is still being prepared. Please try again shortly." },
        { status: 503, headers: { "Retry-After": "2" } },
      );
    }
    await sleep(400);
  }

  if (!clipId) throw new Error("Voice clip generation was claimed without a cache row.");

  let wav: Buffer;
  try {
    wav = await synthesize(text, lang, false, async () => {
      const day = new Date().toISOString().slice(0, 10);
      try {
        const usage = await prisma.geminiVoiceUsage.upsert({
          where: { day },
          create: { day, count: 1 },
          update: { count: { increment: 1 } },
          select: { count: true },
        });
        console.log(`[voice] Gemini voice calls today: ${usage.count}`);
      } catch (error) {
        console.error("[voice] could not update Gemini voice usage:", error);
        throw new VoiceUsageError("Could not record voice usage.");
      }
    });
  } catch (error) {
    await prisma.speechClip.update({ where: { id: clipId }, data: { status: "failed" } });
    if (error instanceof VoiceUsageError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return aiErrorResponse("voice/speak", GEMINI_TTS_MODEL, error);
  }

  try {
    await saveAudio(audioPath, wav);
    await prisma.speechClip.update({
      where: { id: clipId },
      data: { audioPath, status: "ready" },
    });
    await attachToTurn();
    console.log("[voice] saved clip used");
    return cachedAudioResponse(wav, false);
  } catch (error) {
    await prisma.speechClip.update({ where: { id: clipId }, data: { status: "failed" } });
    console.error("[voice] could not persist generated clip:", error);
    return NextResponse.json({ error: "Could not save this voice clip." }, { status: 500 });
  }
}
