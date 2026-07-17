import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { isDateSeed, isModeSeedAllowed, jstToday, questionCountFor } from "#/lib/quiz-config";

import type { RunResult } from "#/lib/quiz-types";

export const runResultInputSchema = z
  .object({
    answers: z.string().regex(/^[0-3]*$/),
    game: z.enum(["play", "pick"]),
    mode: z.enum(["easy", "hard"]),
    seed: z.string().min(1).max(100),
  })
  .refine((data) =>
    data.game === "play" ? !isDateSeed(data.seed) : isModeSeedAllowed(data.mode, data.seed),
  )
  .refine((data) => !isDateSeed(data.seed) || data.seed <= jstToday())
  .refine((data) => data.answers.length <= questionCountFor(data.mode));

export const getRunResult = createServerFn({ method: "GET" })
  .validator(runResultInputSchema)
  .handler(async ({ data }): Promise<RunResult> => {
    setResponseHeader("cache-control", "private, no-store");
    const total = questionCountFor(data.mode);
    if (data.answers.length !== total) {
      return { error: "まだすべての問題に回答していません。", success: false };
    }
    try {
      const { dealAnswer, dealPickAnswer } = await import("#/lib/deal.server");
      const { decodeAnswer } = await import("#/lib/answer-cipher.server");
      const dealAnswerFor = data.game === "pick" ? dealPickAnswer : dealAnswer;
      const secretKey = process.env.ANSWER_CIPHER_SECRET ?? "";
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
