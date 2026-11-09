import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LIMITS } from "@/lib/config";
import { GEMINI_MODEL } from "@/lib/ai/config";
import { aiErrorResponse } from "@/lib/gemini";
import { askMei } from "@/lib/mei/reply";

// The client sends ONLY the chat messages. Model and system prompt stay on the server.
const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "model"]), text: z.string().trim().min(1).max(500) }))
    .min(1)
    .max(12),
});

const today = () => new Date().toISOString().slice(0, 10);

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.messages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  const day = today();
  const usage = await prisma.meiUsage.findUnique({ where: { userId_day: { userId, day } } });
  if ((usage?.count ?? 0) >= LIMITS.meiDailyMessages) {
    return NextResponse.json(
      { error: "You've used all of today's messages with Mei. Come back tomorrow!", remaining: 0 },
      { status: 429 }
    );
  }

  const phrases = await prisma.phrase.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: LIMITS.meiPhrasesInPrompt,
    select: { pinyin: true, meaning: true },
  });

  try {
    const reply = await askMei(parsed.data.messages, phrases);

    // Count only successful replies.
    const updated = await prisma.meiUsage.upsert({
      where: { userId_day: { userId, day } },
      create: { userId, day, count: 1 },
      update: { count: { increment: 1 } },
    });

    return NextResponse.json({
      reply,
      remaining: Math.max(LIMITS.meiDailyMessages - updated.count, 0),
    });
  } catch (error) {
    return aiErrorResponse("mei", GEMINI_MODEL, error);
  }
}
