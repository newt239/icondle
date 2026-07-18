import { z } from "zod";

import { isDateSeed, quizConfig } from "#/lib/quiz";

export const questionInputSchema = z
  .object({
    mode: z.enum(["easy", "hard"]),
    n: z.number().int().min(1),
    seed: z.string().min(1).max(100),
  })
  .refine((data) => !isDateSeed(data.seed))
  .refine((data) => data.n <= quizConfig[data.mode].questionCount);
