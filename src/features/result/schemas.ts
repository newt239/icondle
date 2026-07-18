import { z } from "zod";

import { jstToday } from "#/lib/date";
import { isDateSeed, isModeSeedAllowed, quizConfig } from "#/lib/quiz";

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
  .refine((data) => data.answers.length <= quizConfig[data.mode].questionCount);
