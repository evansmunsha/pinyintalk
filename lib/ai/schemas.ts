// JSON Schemas for Gemini structured output (config.responseJsonSchema).
// Optional fields are left out of "required" and kept short.

export const MEI_REPLY_SCHEMA = {
  type: "object",
  properties: {
    pinyin: { type: "string", description: "Mei's short Mandarin reply in pinyin with tone marks. No Chinese characters." },
    speech: { type: "string", description: "The same sentence in Chinese characters, used only for audio." },
    english: { type: "string", description: "Starts with 'I said,' then the meaning of the Mandarin sentence." },
    note: { type: "string", description: "Optional. One short English line (max 12 words)." },
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
  required: ["pinyin", "english"],
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
  },
  required: ["heard", "reply"],
} as const;
