// Hint cards are plain data (free and instant, no AI calls).
// To add a hint: add an object here, then add a matcher for it in lib/hints.ts.
export type Hint = {
  key: string;
  title: string;
  body: string;
  examples: { pinyin: string; english: string }[];
};

export const HINTS: Record<string, Hint> = {
  ma: {
    key: "ma",
    title: "ma makes a question",
    body: 'Put "ma" at the end of a statement to turn it into a yes or no question.',
    examples: [
      { pinyin: "nǐ xǐhuān zhōngwén.", english: "You like Chinese." },
      { pinyin: "nǐ xǐhuān zhōngwén ma?", english: "Do you like Chinese?" },
    ],
  },
  bu: {
    key: "bu",
    title: "bù means not",
    body: 'Use "bù" to say "not" in the present and future, or when you do not want to do something. Tone note: bù changes to bú before a fourth-tone word.',
    examples: [
      { pinyin: "wǒ bù xǐhuān zhōngwén", english: "I don't like Chinese" },
      { pinyin: "wǒ bù chī", english: "I don't eat / I don't want to eat" },
      { pinyin: "wǒ bú qù", english: "I'm not going" },
    ],
  },
  meiyou: {
    key: "meiyou",
    title: "méiyǒu means did not",
    body: 'Use "méiyǒu" to say something did not happen, or you have not done it.',
    examples: [
      { pinyin: "wǒ méiyǒu chī píngguǒ", english: "I didn't eat the apple" },
      {
        pinyin: "wǒ de jiějie zuótiān méiyǒu qù měiguó",
        english: "My older sister didn't go to the US yesterday",
      },
    ],
  },
  wordOrder: {
    key: "wordOrder",
    title: "word order",
    body: "Chinese goes: subject, then time, then place, then verb.",
    examples: [
      {
        pinyin: "wǒ měitiān zài jiā chī yí ge píngguǒ",
        english: "I eat an apple at home every day",
      },
    ],
  },
  questionWords: {
    key: "questionWords",
    title: "question words",
    body: "Shénme (what), nǎge (which) and nǎlǐ (where) go where the answer would go, after the verb. Shénme shíhou (when), wèishénme (why) and zěnme (how) go before the verb.",
    examples: [
      { pinyin: "nǐ xǐhuān shénme?", english: "What do you like?" },
      { pinyin: "nǐ shénme shíhou qù?", english: "When are you going?" },
      { pinyin: "nǐ wèishénme qù měiguó?", english: "Why are you going to the US?" },
      { pinyin: "nǐ zěnme qù?", english: "How are you going?" },
    ],
  },
  timeQuestion: {
    key: "timeQuestion",
    title: "time with question words",
    body: "The time phrase comes before the question word.",
    examples: [{ pinyin: "nǐ míngtiān zěnme qù?", english: "How are you going tomorrow?" }],
  },
};
