import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { isDateSeed, jstToday, PLAY_QUESTION_COUNT, questionCountFor } from "./quiz-config";

import type { GradeResult, RunResult } from "./quiz-types";

const gradeInputSchema = z
  .object({
    answer: z.number().int().min(0).max(3),
    n: z.number().int().min(1).max(PLAY_QUESTION_COUNT),
    seed: z.string().min(1).max(100),
  })
  .refine((data) => data.n <= questionCountFor(data.seed))
  .refine((data) => !isDateSeed(data.seed) || data.seed <= jstToday());

export const gradeAnswer = createServerFn({ method: "POST" })
  .validator(gradeInputSchema)
  .handler(async ({ data }): Promise<GradeResult> => {
    try {
      const { dealAnswer } = await import("./deal.server");
      const { answerIndex, meta } = dealAnswer(data.seed, data.n);
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

const runResultInputSchema = z
  .object({
    answers: z
      .string()
      .regex(/^[0-3]*$/)
      .max(PLAY_QUESTION_COUNT),
    seed: z.string().min(1).max(100),
  })
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
      const { dealAnswer } = await import("./deal.server");
      const items = [...data.answers].map((picked, index) => {
        const n = index + 1;
        const { answerIndex, meta } = dealAnswer(data.seed, n);
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
