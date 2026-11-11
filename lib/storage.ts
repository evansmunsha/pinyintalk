import "server-only";
import { del, get, put } from "@vercel/blob";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "storage", "audio");
const USE_BLOB_STORAGE = process.env.VERCEL === "1" || process.env.AUDIO_STORAGE_PROVIDER === "vercel-blob";

function isMissingFile(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function resolveSafe(relPath: string) {
  const normalized = normalizeAudioPath(relPath);
  const full = path.resolve(ROOT, normalized);
  if (!full.startsWith(ROOT + path.sep)) throw new Error("Invalid storage path");
  return full;
}

function normalizeAudioPath(relPath: string) {
  const normalized = relPath.replaceAll("\\", "/");
  if (!normalized || normalized.startsWith("/") || normalized.includes("\0") || normalized.split("/").includes("..")) {
    throw new Error("Invalid storage path");
  }
  return normalized;
}

export async function saveAudio(relPath: string, data: Buffer): Promise<string> {
  if (USE_BLOB_STORAGE) {
    const blob = await put(normalizeAudioPath(relPath), data, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 31_536_000,
      contentType: "audio/wav",
    });
    return blob.pathname;
  }

  const full = resolveSafe(relPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
  return relPath;
}

export async function readAudio(relPath: string): Promise<Buffer | null> {
  if (USE_BLOB_STORAGE) {
    const blob = await get(normalizeAudioPath(relPath), { access: "public" });
    if (!blob || blob.statusCode !== 200 || !blob.stream) return null;
    return Buffer.from(await new Response(blob.stream).arrayBuffer());
  }

  try {
    return await readFile(resolveSafe(relPath));
  } catch (error) {
    if (isMissingFile(error)) return null;
    throw error;
  }
}

export async function audioExists(relPath: string): Promise<boolean> {
  if (USE_BLOB_STORAGE) return (await get(normalizeAudioPath(relPath), { access: "public" }))?.statusCode === 200;

  try {
    return (await stat(resolveSafe(relPath))).isFile();
  } catch (error) {
    if (isMissingFile(error)) return false;
    throw error;
  }
}

export async function deleteAudio(relPath: string | null | undefined) {
  if (!relPath) return;
  if (USE_BLOB_STORAGE) {
    await del(normalizeAudioPath(relPath));
    return;
  }

  try {
    await rm(resolveSafe(relPath), { force: true });
  } catch (error) {
    if (!isMissingFile(error)) throw error;
  }
}
