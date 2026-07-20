import { z } from "zod";

import { isSeedPlayable, quizConfig } from "#/lib/quiz";

export const runResultInputSchema = z
  .object({
    answers: z.string().regex(/^[0-3]*$/),
    game: z.enum(["play", "pick"]),
    mode: z.enum(["easy", "hard"]),
    seed: z.string().min(1).max(100),
  })
  .refine((data) => isSeedPlayable(data.game, data.mode, data.seed))
  .refine((data) => data.answers.length <= quizConfig[data.mode].questionCount);
