import { TONE_COLORS } from "@/lib/tone-colors";

const TONE_OF: Record<string, 1 | 2 | 3 | 4> = {};
const MARKS: [string, string][] = [
  ["aeiouü", "āēīōūǖ"],
  ["aeiouü", "áéíóúǘ"],
  ["aeiouü", "ǎěǐǒǔǚ"],
  ["aeiouü", "àèìòùǜ"],
];
MARKS.forEach(([, chars], i) => {
  for (const ch of chars) {
    TONE_OF[ch] = (i + 1) as 1 | 2 | 3 | 4;
    TONE_OF[ch.toUpperCase()] = (i + 1) as 1 | 2 | 3 | 4;
  }
});

// One syllable: optional initial, vowels, optional final n / ng / r (only when not starting the next syllable).
const V = "aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ";
const SYLLABLE = new RegExp(
  `((?:zh|ch|sh|[bpmfdtnlgkhjqxrzcswy])?[${V}]+(?:ng(?![${V}])|n(?![${V}])|r(?![${V}]))?)`,
  "gi"
);

export function toneOf(syllable: string): number {
  for (const ch of syllable) if (TONE_OF[ch]) return TONE_OF[ch];
  return 5;
}

export function Pinyin({ text, className = "" }: { text: string; className?: string }) {
  // split() with a capture group keeps the syllables at the odd positions.
  const pieces = text.split(SYLLABLE);
  return (
    <span className={className}>
      {pieces.map((p, i) => {
        const tone = i % 2 === 1 ? toneOf(p) : 5;
        if (i % 2 === 0) return <span key={i}>{p}</span>;
        const color = [TONE_COLORS.first, TONE_COLORS.second, TONE_COLORS.third, TONE_COLORS.fourth][tone - 1] ?? TONE_COLORS.neutral;
        return <span key={i} style={{ color }}>{p}</span>;
      })}
    </span>
  );
}
