import { z } from "zod";

const noHanzi = (text: string) => !/[\u3400-\u9fff]/.test(text);

export const communityQuestionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(3, "Type your question")
    .max(500)
    .refine(noHanzi, "Please type pinyin, not Chinese characters"),
  level: z.enum(["beginner", "tones", "travel"]),
});

export const teacherResponseSchema = z.object({
  text: z.string().trim().min(3, "Write a reply").max(1000).refine(noHanzi, "Please use English or pinyin, not Chinese characters"),
  examplePinyin: z.string().trim().max(240).refine(noHanzi, "Please use pinyin, not Chinese characters"),
});
