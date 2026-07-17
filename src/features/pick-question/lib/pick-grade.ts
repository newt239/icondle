import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { isDateSeed, isModeSeedAllowed, jstToday, questionCountFor } from "#/lib/quiz-config";

import type { PickGradeResult } from "#/lib/quiz-types";

export const pickGradeInputSchema = z
  .object({
    answer: z.number().int().min(0).max(3),
    mode: z.enum(["easy", "hard"]),
    n: z.number().int().min(1),
    seed: z.string().min(1).max(100),
  })
  .refine((data) => isModeSeedAllowed(data.mode, data.seed))
  .refine((data) => data.n <= questionCountFor(data.mode))
  .refine((data) => !isDateSeed(data.seed) || data.seed <= jstToday());

export const gradePickAnswer = createServerFn({ method: "POST" })
  .validator(pickGradeInputSchema)
  .handler(async ({ data }): Promise<PickGradeResult> => {
    try {
      const { dealPickAnswer } = await import("#/lib/deal.server");
      const { encodeAnswer, requireAnswerCipherSecret } =
        await import("#/lib/answer-cipher.server");
      const { answerIndex, choiceLabels, meta } = dealPickAnswer(data.mode, data.seed, data.n);
      const encodedAnswer = encodeAnswer(
        requireAnswerCipherSecret(),
        { game: "pick", mode: data.mode, n: data.n, seed: data.seed },
        data.answer,
      );
      return {
        answerIndex,
        choiceLabels,
        correct: answerIndex === data.answer,
        encodedAnswer,
        meta,
        success: true,
      };
    } catch (error) {
      console.error(error);
      return { error: "判定に失敗しました。時間をおいて再度お試しください。", success: false };
    }
  });
