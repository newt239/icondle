import { createServerFn } from "@tanstack/react-start";

import { gradeInputSchema } from "#/features/question/schemas";

import type { GradeResult } from "#/types";

export const gradeAnswer = createServerFn({ method: "POST" })
  .validator(gradeInputSchema)
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
