import "server-only";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

// Audio storage. Local folder in development. To move to cloud storage later, change only this file:
// the database keeps just the returned path, and files are always served through /api/files (with an owner check).
const ROOT = path.join(process.cwd(), "storage", "audio");

function resolveSafe(relPath: string) {
  const full = path.resolve(ROOT, relPath);
  if (!full.startsWith(ROOT + path.sep)) throw new Error("Invalid storage path");
  return full;
}

export async function saveAudio(relPath: string, data: Buffer): Promise<string> {
  const full = resolveSafe(relPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
  return relPath;
}

export async function readAudio(relPath: string): Promise<Buffer | null> {
  try {
    return await readFile(resolveSafe(relPath));
  } catch {
    return null;
  }
}

export async function audioExists(relPath: string): Promise<boolean> {
  try {
    return (await stat(resolveSafe(relPath))).isFile();
  } catch {
    return false;
  }
}

export async function deleteAudio(relPath: string | null | undefined) {
  if (!relPath) return;
  await rm(resolveSafe(relPath), { force: true }).catch(() => undefined);
}
