// Strips tone marks and punctuation so "bù", "bú" and "bu" all match "bu".
export function normalizePinyin(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Mei and users should never see Chinese characters in the UI.
export function stripHanzi(input: string): string {
  return input.replace(/[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/g, "").trim();
}

export const HANZI_ONLY = /^[\u3400-\u9fff，。？！、\s]{1,80}$/;
