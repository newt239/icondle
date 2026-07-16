import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import {
  isDateSeed,
  isModeSeedAllowed,
  jstToday,
  PLAY_QUESTION_COUNT,
  questionCountFor,
} from "#/lib/quiz-config";

import type { RunResult } from "#/lib/quiz-types";

export const runResultInputSchema = z
  .object({
    answers: z
      .string()
      .regex(/^[0-3]*$/)
      .max(PLAY_QUESTION_COUNT),
    game: z.enum(["play", "pick"]),
    mode: z.enum(["easy", "hard"]),
    seed: z.string().min(1).max(100),
  })
  .refine((data) =>
    data.game === "play" ? !isDateSeed(data.seed) : isModeSeedAllowed(data.mode, data.seed),
  )
  .refine((data) => !isDateSeed(data.seed) || data.seed <= jstToday());

export const getRunResult = createServerFn({ method: "GET" })
  .validator(runResultInputSchema)
  .handler(async ({ data }): Promise<RunResult> => {
    setResponseHeader("cache-control", "private, no-store");
    const total = questionCountFor(data.seed);
    if (data.answers.length !== total) {
      return { error: "まだすべての問題に回答していません。", success: false };
    }
    try {
      const { dealAnswer, dealPickAnswer } = await import("#/lib/deal.server");
      const dealAnswerFor = data.game === "pick" ? dealPickAnswer : dealAnswer;
      const items = Array.from(data.answers, (picked, index) => {
        const n = index + 1;
        const { answerIndex, meta } = dealAnswerFor(data.mode, data.seed, n);
        return {
          answerIndex,
          correct: Number(picked) === answerIndex,
          meta,
          n,
          picked: Number(picked),
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
