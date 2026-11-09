// JSON Schemas for Gemini structured output (config.responseJsonSchema).
// Optional fields are left out of "required" and kept short.

export const MEI_REPLY_SCHEMA = {
  type: "object",
  properties: {
    pinyin: { type: "string", description: "Mei's short Mandarin reply in pinyin with tone marks. No Chinese characters." },
    speech: { type: "string", description: "The same sentence in Chinese characters, used only for audio." },
    english: { type: "string", description: "Starts with 'I said,' then the meaning of the Mandarin sentence." },
    note: { type: "string", description: "A brief beginner-friendly English explanation of the Mandarin phrase, distinct from its translation. Maximum 12 words." },
    newPhrase: {
      type: "object",
      description: "Optional. At most one new short phrase.",
      properties: {
        pinyin: { type: "string" },
        meaning: { type: "string" },
        speech: { type: "string" },
      },
      required: ["pinyin", "meaning"],
    },
  },
  required: ["pinyin", "english", "note"],
} as const;

export const TALK_SCHEMA = {
  type: "object",
  properties: {
    heard: {
      type: "object",
      properties: { pinyin: { type: "string" }, english: { type: "string" } },
      required: ["pinyin", "english"],
    },
    reply: {
      type: "object",
      properties: {
        pinyin: { type: "string" },
        speech: { type: "string" },
        english: { type: "string" },
      },
      required: ["pinyin", "english"],
    },
    toneFeedback: {
      type: "object",
      description: "A brief estimate of the learner's Mandarin tone accuracy from the audio.",
      properties: {
        summary: { type: "string", description: "One short English sentence summarizing tone accuracy." },
        syllables: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pinyin: { type: "string", description: "One recognized Mandarin syllable with its tone mark." },
              status: { type: "string", enum: ["clear", "practice", "unclear"] },
              tip: { type: "string", description: "One short English correction cue, or empty when clear." },
            },
            required: ["pinyin", "status", "tip"],
          },
        },
      },
      required: ["summary", "syllables"],
    },
  },
  required: ["heard", "reply", "toneFeedback"],
} as const;
