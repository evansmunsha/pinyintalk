import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { communityAudioPath, communityAudioUrl, validateCommunityWav } from "@/lib/community-audio";
import { communityVoiceQuestionSchema } from "@/lib/community-schemas";
import prisma from "@/lib/prisma";
import { deleteAudio, saveAudio } from "@/lib/storage";

const dayStartUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid question form." }, { status: 400 });
  }

  const audioValidation = await validateCommunityWav(form.get("audio"));
  if (!audioValidation.ok) return NextResponse.json({ error: audioValidation.error }, { status: 400 });
  const audio = audioValidation.file;
  if (!audio) return NextResponse.json({ error: "A voice post must include a recording." }, { status: 400 });
  const groupId = String(form.get("groupId") ?? "").trim() || undefined;
  const parsed = communityVoiceQuestionSchema.safeParse({
    text: form.get("text"),
    meaning: form.get("meaning"),
    level: form.get("level"),
    ...(groupId ? { groupId } : {}),
  });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid question." }, { status: 400 });

  let questionId: string | null = null;
  let audioPath: string | null = null;
  try {
    const question = await prisma.$transaction(async (tx) => {
      if (parsed.data.groupId) {
        const membership = await tx.communityGroupMember.findUnique({
          where: { groupId_userId: { groupId: parsed.data.groupId, userId } },
          select: { id: true },
        });
        if (!membership) return { error: "Join this group before posting." } as const;
      }
      const count = await tx.communityQuestion.count({ where: { userId, createdAt: { gte: dayStartUtc() } } });
      if (count >= 10) return { error: "You’ve reached today’s limit of 10 community posts." } as const;
      return {
        question: await tx.communityQuestion.create({
          data: {
            userId,
            text: parsed.data.text,
            meaning: parsed.data.meaning,
            level: parsed.data.level,
            groupId: parsed.data.groupId ?? null,
          },
          select: { id: true },
        }),
      } as const;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if ("error" in question) return NextResponse.json({ error: question.error }, { status: 400 });
    questionId = question.question.id;

    audioPath = communityAudioPath("question", question.question.id);
    await saveAudio(audioPath, Buffer.from(await audio.arrayBuffer()));
    await prisma.communityQuestion.update({
      where: { id: question.question.id },
      data: { voiceNoteUrl: communityAudioUrl("question", question.question.id) },
    });

    revalidatePath("/community");
    if (parsed.data.groupId) revalidatePath(`/community/groups/${parsed.data.groupId}`);
    return NextResponse.json({ ok: true, id: question.question.id });
  } catch (error) {
    if (audioPath) await deleteAudio(audioPath);
    if (questionId) {
      try {
        await prisma.communityQuestion.delete({ where: { id: questionId } });
      } catch (cleanupError) {
        console.error("[community] could not roll back question:", cleanupError);
      }
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return NextResponse.json({ error: "Could not reserve a post slot. Please try again." }, { status: 409 });
    }
    console.error("[community] could not save question:", error);
    return NextResponse.json({ error: "Could not save your question. Please try again." }, { status: 500 });
  }
}
