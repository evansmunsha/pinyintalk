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
    .max(10),
  conversationId: z.string().min(1).max(60).optional(),
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

  if (parsed.data.conversationId) {
    const ownedConversation = await prisma.conversation.findFirst({
      where: { id: parsed.data.conversationId, userId },
      select: { id: true },
    });
    if (!ownedConversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const day = today();
  const usage = await prisma.meiUsage.findUnique({ where: { userId_day: { userId, day } } });
  if ((usage?.count ?? 0) >= LIMITS.meiDailyMessages) {
    return NextResponse.json(
      { error: "You've used all of today's messages with Mei. Come back tomorrow!", remaining: 0 },
      { status: 429 }
    );
  }

  const [user, phrases] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.phrase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: LIMITS.meiPhrasesInPrompt,
      select: { pinyin: true, meaning: true },
    }),
  ]);
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const learnerName = user.name.trim().split(/\s+/)[0] || "learner";

  let reply: Awaited<ReturnType<typeof askMei>>;
  try {
    reply = await askMei(parsed.data.messages, phrases, learnerName);
  } catch (error) {
    return aiErrorResponse("mei", GEMINI_MODEL, error);
  }

  try {
    const lastMessage = parsed.data.messages.at(-1)!;
    const saved = await prisma.$transaction(async (tx) => {
      const conversation = parsed.data.conversationId
        ? await tx.conversation.findFirst({
            where: { id: parsed.data.conversationId, userId },
            select: { id: true },
          })
        : await tx.conversation.create({ data: { userId }, select: { id: true } });
      if (!conversation) throw new Error("Conversation is no longer available.");

      const turn = await tx.conversationTurn.create({
        data: {
          conversationId: conversation.id,
          userId,
          heardPinyin: lastMessage.text,
          heardEnglish: "",
          replyPinyin: reply.pinyin,
          replyEnglish: reply.english,
          replySpeech: reply.speech ?? null,
        },
        select: { id: true, createdAt: true },
      });
      await tx.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
      const updatedUsage = await tx.meiUsage.upsert({
        where: { userId_day: { userId, day } },
        create: { userId, day, count: 1 },
        update: { count: { increment: 1 } },
      });

      return { conversationId: conversation.id, turnId: turn.id, createdAt: turn.createdAt, count: updatedUsage.count };
    });

    return NextResponse.json({
      reply,
      conversationId: saved.conversationId,
      turnId: saved.turnId,
      createdAt: saved.createdAt,
      remaining: Math.max(LIMITS.meiDailyMessages - saved.count, 0),
    });
  } catch (error) {
    console.error("[mei] could not save typed conversation:", error);
    return NextResponse.json({ error: "Mei replied, but the conversation could not be saved. Please try again." }, { status: 500 });
  }
}
