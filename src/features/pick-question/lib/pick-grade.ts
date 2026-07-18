import { createServerFn } from "@tanstack/react-start";

import { pickGradeInputSchema } from "#/features/pick-question/schemas";

import type { PickGradeResult } from "#/types";

export const gradePickAnswer = createServerFn({ method: "POST" })
  .validator(pickGradeInputSchema)
  .handler(async ({ data }): Promise<PickGradeResult> => {
    try {
      const { dealPickAnswer } = await import("#/lib/deal.server");
      const { encodeAnswer, requireAnswerCipherSecret } = await import("#/lib/cipher.server");
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
