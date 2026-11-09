export const MAX_COMMUNITY_AUDIO_BYTES = 2 * 1024 * 1024;

export type CommunityAudioKind = "question" | "response";

export function communityAudioPath(kind: CommunityAudioKind, id: string) {
  const folder = kind === "question" ? "questions" : "responses";
  return `community/${folder}/${id}.wav`;
}

export function communityAudioUrl(kind: CommunityAudioKind, id: string) {
  return `/api/community/audio/${kind}/${id}`;
}

export function isCommunityWav(value: FormDataEntryValue | null): value is File | null {
  if (value === null) return true;
  return value instanceof File && value.size > 0 && value.size <= MAX_COMMUNITY_AUDIO_BYTES && value.type === "audio/wav";
}
