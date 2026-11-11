import { randomUUID } from "node:crypto";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rateLimitWindow } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MIME_FORMATS: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Please sign in first." }, { status: 401 });

  const ipKey = request.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = rateLimitWindow(`profile-image:${ipKey}`, 10, 60_000);
  if (!rateLimit.allowed) {
    return Response.json({ error: "Too many image uploads. Please wait a moment." }, { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.resetMs / 1000)) } });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE + 65_536) {
    return Response.json({ error: "Images must be no larger than 2 MB." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Choose a JPG, PNG, or WebP image." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Choose a JPG, PNG, or WebP image." }, { status: 400 });
  }
  if (!MIME_FORMATS[file.type] || file.size === 0 || file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "Images must be JPG, PNG, or WebP and no larger than 2 MB." }, { status: 400 });
  }

  const previous = await prisma.user.findUnique({
    where: { id: userId },
    select: { profileImageUrl: true },
  });
  if (!previous) return Response.json({ error: "Your account could not be found." }, { status: 404 });

  let processed: Buffer;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { failOn: "error", limitInputPixels: 25_000_000 });
    const metadata = await image.metadata();
    if (metadata.format !== MIME_FORMATS[file.type]) {
      return Response.json({ error: "The image contents do not match the selected file type." }, { status: 400 });
    }
    processed = await image
      .rotate()
      .resize(512, 512, { fit: "cover", position: "centre" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch (error) {
    console.error("[profile-image] image processing failed:", error);
    return Response.json({ error: "This image could not be processed. Try another image." }, { status: 400 });
  }

  try {
    const blob = await put(`profile-images/${userId}/${randomUUID()}.webp`, processed, {
      access: "public",
      addRandomSuffix: false,
      contentType: "image/webp",
      cacheControlMaxAge: 31_536_000,
    });
    await prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: blob.url },
    });

    if (previous.profileImageUrl) {
      try {
        await del(previous.profileImageUrl);
      } catch (error) {
        console.error("[profile-image] previous image could not be removed:", error);
      }
    }

    return Response.json({ profileImageUrl: blob.url });
  } catch (error) {
    console.error("[profile-image] upload failed:", error);
    return Response.json({ error: "Your image could not be saved. Please try again." }, { status: 500 });
  }
}
