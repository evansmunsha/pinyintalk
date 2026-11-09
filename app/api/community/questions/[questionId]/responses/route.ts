import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { communityAudioPath, communityAudioUrl, isCommunityWav } from "@/lib/community-audio";
import { teacherResponseSchema } from "@/lib/community-schemas";
import prisma from "@/lib/prisma";
import { deleteAudio, saveAudio } from "@/lib/storage";

export async function POST(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const teacher = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, isTeacher: true } });
  if (!teacher?.isTeacher) return NextResponse.json({ error: "Only teachers can reply." }, { status: 403 });

  const { questionId } = await params;
  const question = await prisma.communityQuestion.findUnique({ where: { id: questionId }, select: { id: true } });
  if (!question) return NextResponse.json({ error: "Question not found." }, { status: 404 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid reply form." }, { status: 400 });
  }

  const parsed = teacherResponseSchema.safeParse({
    text: form.get("text"),
    examplePinyin: form.get("examplePinyin") ?? "",
  });
  const audio = form.get("audio");
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid reply." }, { status: 400 });
  if (!isCommunityWav(audio)) return NextResponse.json({ error: "Voice notes must be WAV audio under 2 MB." }, { status: 400 });

  let responseId: string | null = null;
  let audioPath: string | null = null;
  try {
    const response = await prisma.teacherResponse.create({
      data: {
        questionId,
        teacherName: teacher.name,
        text: parsed.data.text,
        examplePinyin: parsed.data.examplePinyin || null,
      },
      select: { id: true },
    });
    responseId = response.id;

    if (audio) {
      audioPath = communityAudioPath("response", response.id);
      await saveAudio(audioPath, Buffer.from(await audio.arrayBuffer()));
      await prisma.$transaction([
        prisma.teacherResponse.update({
          where: { id: response.id },
          data: { voiceNoteUrl: communityAudioUrl("response", response.id) },
        }),
        prisma.communityQuestion.update({ where: { id: questionId }, data: { status: "answered" } }),
      ]);
    } else {
      await prisma.communityQuestion.update({ where: { id: questionId }, data: { status: "answered" } });
    }

    revalidatePath("/community");
    return NextResponse.json({ ok: true, id: response.id });
  } catch (error) {
    if (audioPath) await deleteAudio(audioPath);
    if (responseId) {
      try {
        await prisma.teacherResponse.delete({ where: { id: responseId } });
      } catch (cleanupError) {
        console.error("[community] could not roll back teacher reply:", cleanupError);
      }
    }
    console.error("[community] could not save teacher reply:", error);
    return NextResponse.json({ error: "Could not save the reply. Please try again." }, { status: 500 });
  }
}
