export const MAX_COMMUNITY_AUDIO_BYTES = 2 * 1024 * 1024;

export type CommunityAudioKind = "question" | "response";

export function communityAudioPath(kind: CommunityAudioKind, id: string) {
  const folder = kind === "question" ? "questions" : "responses";
  return `community/${folder}/${id}.wav`;
}

export function communityAudioUrl(kind: CommunityAudioKind, id: string) {
  return `/api/community/audio/${kind}/${id}`;
}

export async function validateCommunityWav(
  value: FormDataEntryValue | null
): Promise<{ ok: true; file: File | null } | { ok: false; error: string }> {
  if (value === null) return { ok: true, file: null };
  if (typeof value === "string") return { ok: false, error: "The voice note upload was not an audio file." };
  if (value.size === 0) return { ok: false, error: "The voice note recording is empty." };
  if (value.size > MAX_COMMUNITY_AUDIO_BYTES) return { ok: false, error: "Voice notes must be under 2 MB." };

  const header = new Uint8Array(await value.slice(0, 12).arrayBuffer());
  const riff = String.fromCharCode(...header.subarray(0, 4));
  const wave = String.fromCharCode(...header.subarray(8, 12));
  if (riff !== "RIFF" || wave !== "WAVE") {
    return { ok: false, error: "The recording is not a valid WAV file. Please record it again." };
  }

  return { ok: true, file: value };
}
