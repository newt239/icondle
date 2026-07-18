import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { runResultInputSchema } from "#/features/result/schemas";
import { quizConfig } from "#/lib/quiz";

import type { RunResult } from "#/types";

export const getRunResult = createServerFn({ method: "GET" })
  .validator(runResultInputSchema)
  .handler(async ({ data }): Promise<RunResult> => {
    setResponseHeader("cache-control", "private, no-store");
    const total = quizConfig[data.mode].questionCount;
    if (data.answers.length !== total) {
      return { error: "まだすべての問題に回答していません。", success: false };
    }
    try {
      const { dealAnswer, dealPickAnswer } = await import("#/lib/deal.server");
      const { decodeAnswer, requireAnswerCipherSecret } = await import("#/lib/cipher.server");
      const dealAnswerFor = data.game === "pick" ? dealPickAnswer : dealAnswer;
      const secretKey = requireAnswerCipherSecret();
      const items = Array.from(data.answers, (encodedChar, index) => {
        const n = index + 1;
        const { answerIndex, meta } = dealAnswerFor(data.mode, data.seed, n);
        const picked = decodeAnswer(
          secretKey,
          { game: data.game, mode: data.mode, n, seed: data.seed },
          Number(encodedChar),
        );
        return {
          answerIndex,
          correct: picked === answerIndex,
          meta,
          n,
          picked,
        };
      });
      return {
        items,
        score: items.filter((item) => item.correct).length,
        success: true,
        total,
      };
    } catch (error) {
      console.error(error);
      return { error: "結果の取得に失敗しました。", success: false };
    }
  });
