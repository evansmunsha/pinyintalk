import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { readAudio } from "@/lib/storage";

const kindSchema = z.enum(["learner", "zh", "en"]);

// Serves saved conversation audio. Only the owner can fetch it, and it never calls Gemini.
export async function GET(request: Request, { params }: { params: Promise<{ turnId: string; kind: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { turnId, kind: rawKind } = await params;
  const kind = kindSchema.safeParse(rawKind);
  if (!kind.success) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const turn = await prisma.conversationTurn.findFirst({
    where: { id: turnId, userId },
    select: { learnerAudioPath: true, replyZhAudioPath: true, replyEnAudioPath: true },
  });
  const relPath = kind.data === "learner" ? turn?.learnerAudioPath : kind.data === "zh" ? turn?.replyZhAudioPath : turn?.replyEnAudioPath;
  const data = relPath ? await readAudio(relPath) : null;
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // Range support lets Safari (iPhone) play and seek the file.
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
