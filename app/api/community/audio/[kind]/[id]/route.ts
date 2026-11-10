import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { communityAudioPath, communityAudioUrl } from "@/lib/community-audio";
import prisma from "@/lib/prisma";
import { readAudio } from "@/lib/storage";

const paramsSchema = z.object({ kind: z.enum(["question", "response"]), id: z.string().min(1) });

export async function GET(request: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const { kind, id } = parsed.data;

  let audioUrl: string | null | undefined;
  let groupId: string | null | undefined;
  if (kind === "question") {
    const question = await prisma.communityQuestion.findUnique({ where: { id }, select: { voiceNoteUrl: true, groupId: true } });
    audioUrl = question?.voiceNoteUrl;
    groupId = question?.groupId;
  } else {
    const response = await prisma.teacherResponse.findUnique({ where: { id }, select: { voiceNoteUrl: true, question: { select: { groupId: true } } } });
    audioUrl = response?.voiceNoteUrl;
    groupId = response?.question.groupId;
  }
  if (audioUrl !== communityAudioUrl(kind, id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (groupId) {
    const membership = await prisma.communityGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
      select: { id: true },
    });
    if (!membership) return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const data = await readAudio(communityAudioPath(kind, id));
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const headers = { "Content-Type": "audio/wav", "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=3600" };
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1;
    if (start > end || start >= data.length) return new Response(null, { status: 416, headers });
    return new Response(new Uint8Array(data.subarray(start, end + 1)), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${data.length}`, "Content-Length": String(end - start + 1) },
    });
  }

  return new Response(new Uint8Array(data), { headers: { ...headers, "Content-Length": String(data.length) } });
}
