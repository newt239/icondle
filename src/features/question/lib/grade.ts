import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { isDateSeed, questionCountFor } from "#/lib/quiz-config";

import type { GradeResult } from "#/lib/quiz-types";

export const gradeInputSchema = z
  .object({
    answer: z.number().int().min(0).max(3),
    mode: z.enum(["easy", "hard"]),
    n: z.number().int().min(1),
    seed: z.string().min(1).max(100),
  })
  .refine((data) => !isDateSeed(data.seed))
  .refine((data) => data.n <= questionCountFor(data.mode));

export const gradeAnswer = createServerFn({ method: "POST" })
  .validator(gradeInputSchema)
  .handler(async ({ data }): Promise<GradeResult> => {
    try {
      const { dealAnswer } = await import("#/lib/deal.server");
      const { answerIndex, meta } = dealAnswer(data.mode, data.seed, data.n);
      return {
        answerIndex,
        correct: answerIndex === data.answer,
        meta,
        success: true,
      };
    } catch (error) {
      console.error(error);
      return { error: "判定に失敗しました。時間をおいて再度お試しください。", success: false };
    }
  });
