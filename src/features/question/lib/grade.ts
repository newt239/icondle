import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { isDateSeed, quizConfig } from "#/lib/quiz";

import type { GradeResult } from "#/types";

export const gradeAnswer = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        answer: z.number().int().min(0).max(3),
        mode: z.enum(["easy", "hard"]),
        n: z.number().int().min(1),
        seed: z.string().min(1).max(100),
      })
      .refine((data) => !isDateSeed(data.seed))
      .refine((data) => data.n <= quizConfig[data.mode].questionCount),
  )
  .handler(async ({ data }): Promise<GradeResult> => {
    try {
      const { dealAnswer } = await import("#/lib/deal.server");
      const { encodeAnswer, requireAnswerCipherSecret } = await import("#/lib/cipher.server");
      const { answerIndex, meta } = dealAnswer(data.mode, data.seed, data.n);
      const encodedAnswer = encodeAnswer(
        requireAnswerCipherSecret(),
        { game: "play", mode: data.mode, n: data.n, seed: data.seed },
        data.answer,
      );
      return {
        answerIndex,
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
