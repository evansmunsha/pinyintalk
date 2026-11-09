"use client";

import { useState } from "react";
import { Bi } from "@/components/Bi";
import { Pinyin } from "@/components/Pinyin";
import { TONE_COLORS } from "@/lib/tone-colors";

const VOWELS = ["a", "e", "i", "o", "u", "ü"] as const;
type Vowel = (typeof VOWELS)[number];
type Tone = 1 | 2 | 3 | 4 | 5;

const LETTERS: Record<Vowel, readonly [string, string, string, string, string]> = {
  a: ["ā", "á", "ǎ", "à", "a"],
  e: ["ē", "é", "ě", "è", "e"],
  i: ["ī", "í", "ǐ", "ì", "i"],
  o: ["ō", "ó", "ǒ", "ò", "o"],
  u: ["ū", "ú", "ǔ", "ù", "u"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ", "ü"],
};

const TONE_COLOR: Record<Tone, string> = {
  1: TONE_COLORS.first,
  2: TONE_COLORS.second,
  3: TONE_COLORS.third,
  4: TONE_COLORS.fourth,
  5: TONE_COLORS.neutral,
};

function ToneCurve({ tone }: { tone: Tone }) {
  const paths: Record<Tone, string> = {
    1: "M2 8 L14 8",
    2: "M2 12 Q8 12 14 3",
    3: "M2 4 Q4 12 8 12 Q12 12 14 4",
    4: "M2 3 L14 12",
    5: "M2 8 L14 8",
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke={TONE_COLOR[tone]} strokeLinecap="round" strokeWidth="2">
      <path d={paths[tone]} />
    </svg>
  );
}

export function ToneKeyboard({
  onInsert,
  onBackspace,
}: {
  onInsert: (letter: string) => void;
  onBackspace: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const [activeVowel, setActiveVowel] = useState<Vowel | null>(null);

  if (!visible) {
    return (
      <button type="button" onClick={() => setVisible(true)} className="min-h-11 rounded-xl border border-stone-300 bg-white px-3">
        <Bi label={{ py: "kāiqǐ shēngdiào jiànpán", en: "Show tone keyboard" }} />
      </button>
    );
  }

  return (
    <section aria-label="Tone keyboard" className="space-y-2 rounded-xl border border-stone-200 bg-white p-2">
      <div className="flex items-center justify-between gap-2">
        <Bi label={{ py: "shēngdiào jiànpán", en: "Tone keyboard" }} align="start" className="text-sm" />
        <button type="button" onClick={() => { setVisible(false); setActiveVowel(null); }} className="min-h-11 rounded-lg px-3 text-sm text-stone-600">
          <Bi label={{ py: "yǐncáng", en: "Hide" }} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {VOWELS.map((vowel) => (
          <div key={vowel} className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={activeVowel === vowel}
              onClick={() => setActiveVowel(activeVowel === vowel ? null : vowel)}
              className="min-h-11 min-w-11 rounded-lg border border-stone-300 bg-stone-50 text-lg font-semibold"
            >
              <Pinyin text={vowel} />
            </button>
            {activeVowel === vowel && (
              <div role="listbox" aria-label={`${vowel} tone choices`} className="absolute bottom-full left-0 z-30 mb-2 flex gap-1 rounded-xl border border-stone-300 bg-white p-2 shadow-lg">
                {LETTERS[vowel].map((letter, index) => {
                  const tone = (index + 1) as Tone;
                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      aria-label={`${letter}, tone ${tone === 5 ? "neutral" : tone}`}
                      key={letter}
                      onClick={() => { onInsert(letter); setActiveVowel(null); }}
                      className="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-lg border border-stone-200 text-lg font-semibold"
                      style={{ color: TONE_COLOR[tone] }}
                    >
                      <Pinyin text={letter} />
                      <ToneCurve tone={tone} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        <button type="button" onClick={onBackspace} aria-label="Backspace" className="min-h-11 min-w-11 rounded-lg border border-stone-300 bg-stone-50 px-3 text-lg">
          ⌫
        </button>
      </div>
    </section>
  );
}
