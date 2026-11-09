export const TONE_COLORS = {
  first: "#2563eb",
  second: "#16a34a",
  third: "#9333ea",
  fourth: "#dc2626",
  neutral: "#6b7280",
} as const;

export const TONE_EXAMPLES = [
  { tone: 1, name: "First tone", pinyin: "mā" },
  { tone: 2, name: "Second tone", pinyin: "má" },
  { tone: 3, name: "Third tone", pinyin: "mǎ" },
  { tone: 4, name: "Fourth tone", pinyin: "mà" },
  { tone: 5, name: "Neutral tone", pinyin: "ma" },
] as const;
