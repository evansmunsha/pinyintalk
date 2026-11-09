import { z } from "zod";

export const toneFeedbackSchema = z.object({
  summary: z.string().trim().min(1).max(120),
  syllables: z.array(
    z.object({
      pinyin: z.string().trim().min(1).max(16),
      status: z.enum(["clear", "practice", "unclear"]),
      tip: z.string().trim().max(120),
    })
  ).max(32),
});

export type ToneFeedback = z.infer<typeof toneFeedbackSchema>;
