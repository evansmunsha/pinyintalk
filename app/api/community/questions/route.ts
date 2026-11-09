import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { communityAudioPath, communityAudioUrl, validateCommunityWav } from "@/lib/community-audio";
import { communityQuestionSchema, communityVoiceQuestionSchema } from "@/lib/community-schemas";
import prisma from "@/lib/prisma";
import { deleteAudio, saveAudio } from "@/lib/storage";

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
  const schema = audio ? communityVoiceQuestionSchema : communityQuestionSchema;
  const parsed = schema.safeParse({ text: form.get("text"), level: form.get("level") });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid question." }, { status: 400 });

  let questionId: string | null = null;
  let audioPath: string | null = null;
  try {
    const question = await prisma.communityQuestion.create({
      data: { userId, text: parsed.data.text, level: parsed.data.level },
      select: { id: true },
    });
    questionId = question.id;

    if (audio) {
      audioPath = communityAudioPath("question", question.id);
      await saveAudio(audioPath, Buffer.from(await audio.arrayBuffer()));
      await prisma.communityQuestion.update({
        where: { id: question.id },
        data: { voiceNoteUrl: communityAudioUrl("question", question.id) },
      });
    }

    revalidatePath("/community");
    return NextResponse.json({ ok: true, id: question.id });
  } catch (error) {
    if (audioPath) await deleteAudio(audioPath);
    if (questionId) {
      try {
        await prisma.communityQuestion.delete({ where: { id: questionId } });
      } catch (cleanupError) {
        console.error("[community] could not roll back question:", cleanupError);
      }
    }
    console.error("[community] could not save question:", error);
    return NextResponse.json({ error: "Could not save your question. Please try again." }, { status: 500 });
  }
}
