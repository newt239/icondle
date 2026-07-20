import { z } from "zod";

import { isSeedPlayable, quizConfig, type QuizGame, type QuizMode } from "#/lib/quiz";

const withQuizRules = <T extends { game: QuizGame; mode: QuizMode; n: number; seed: string }>(
  schema: z.ZodType<T>,
) =>
  schema
    .refine((data) => isSeedPlayable(data.game, data.mode, data.seed))
    .refine((data) => data.n <= quizConfig[data.mode].questionCount);

const questionInputShape = z.object({
  game: z.enum(["play", "pick"]),
  mode: z.enum(["easy", "hard"]),
  n: z.number().int().min(1),
  seed: z.string().min(1).max(100),
});

export const questionInputSchema = withQuizRules(questionInputShape);

export const gradeInputSchema = withQuizRules(
  questionInputShape.extend({ answer: z.number().int().min(0).max(3) }),
);
