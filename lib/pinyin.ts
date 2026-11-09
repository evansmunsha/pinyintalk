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

function toneOfPinyinWord(word: string): number | null {
  for (const mark of word.normalize("NFD")) {
    if (mark === "\u0304") return 1;
    if (mark === "\u0301") return 2;
    if (mark === "\u030c") return 3;
    if (mark === "\u0300") return 4;
  }
  return null;
}

function wordParts(token: string): { prefix: string; word: string; suffix: string } | null {
  const match = /^([^\p{L}]*)([\p{L}]+)([^\p{L}]*)$/u.exec(token);
  return match ? { prefix: match[1], word: match[2], suffix: match[3] } : null;
}

// Enforces bù -> bú before a marked fourth-tone syllable and bù before tones 1-3.
export function correctBuToneSandhi(pinyin: string): string {
  const tokens = pinyin.split(/(\s+)/);
  const tokenIndexes = tokens.flatMap((token, index) => (/\S/.test(token) ? [index] : []));

  for (let position = 0; position < tokenIndexes.length - 1; position++) {
    const index = tokenIndexes[position];
    const nextIndex = tokenIndexes[position + 1];
    const current = wordParts(tokens[index]);
    const next = wordParts(tokens[nextIndex]);
    if (!current || !next || current.suffix || next.prefix) continue;
    if (current.word.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase() !== "bu") continue;

    const nextTone = toneOfPinyinWord(next.word);
    if (nextTone !== 1 && nextTone !== 2 && nextTone !== 3 && nextTone !== 4) continue;

    const isUpper = current.word[0] === current.word[0].toUpperCase();
    const uIsUpper = current.word[1] === current.word[1].toUpperCase();
    const corrected = `${isUpper ? "B" : "b"}${uIsUpper ? (nextTone === 4 ? "Ú" : "Ù") : nextTone === 4 ? "ú" : "ù"}`;
    tokens[index] = `${current.prefix}${corrected}${current.suffix}`;
  }

  return tokens.join("");
}

const TONE_MARKS: Record<string, readonly [string, string, string, string]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

function markPinyinSyllable(syllable: string, tone: number): string {
  const lower = syllable.toLowerCase();
  const vowel = lower.includes("a") ? "a" : lower.includes("e") ? "e" : lower.includes("ou") ? "o" : [...lower].reverse().find((char) => char in TONE_MARKS);
  if (!vowel || tone < 1 || tone > 4) return syllable;
  const index = lower.lastIndexOf(vowel);
  const marked = TONE_MARKS[vowel][tone - 1];
  return `${syllable.slice(0, index)}${syllable[index] === syllable[index].toUpperCase() ? marked.toUpperCase() : marked}${syllable.slice(index + 1)}`;
}

export function toneNumbersToMarks(text: string): string {
  return text.replace(/([\p{L}üÜ]+)([1-5])(?=$|[\s,，.。!?！？;:])/gu, (match, syllable: string, toneText: string) => {
    const tone = Number(toneText);
    return tone === 5 ? syllable : markPinyinSyllable(syllable, tone);
  });
}

export function insertToneAtCursor(
  text: string,
  start: number,
  end: number,
  letter: string
): { text: string; cursor: number } {
  const left = text.slice(0, start);
  const right = text.slice(end);
  const initial = /[bpmfdtnlgkhjqxrzcswy]+$/i.exec(left)?.[0] ?? "";
  const beforeInitial = left.slice(0, left.length - initial.length);
  const previousSyllableHasTone = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]$/i.test(beforeInitial);
  const separator = initial && previousSyllableHasTone && !/\s$/.test(beforeInitial) ? " " : "";
  const addition = `${separator}${initial}${letter}`;
  const cursor = beforeInitial.length + addition.length;
  return { text: `${beforeInitial}${addition}${right}`, cursor };
}

export const HANZI_ONLY = /^[\u3400-\u9fff，。？！、\s]{1,80}$/;
