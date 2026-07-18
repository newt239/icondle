import { z } from "zod";

import { isDateSeed, isModeSeedAllowed, jstToday, questionCountFor } from "#/lib/config";

export const pickQuestionInputSchema = z
  .object({
    mode: z.enum(["easy", "hard"]),
    n: z.number().int().min(1),
    seed: z.string().min(1).max(100),
  })
  .refine((data) => isModeSeedAllowed(data.mode, data.seed))
  .refine((data) => data.n <= questionCountFor(data.mode))
  .refine((data) => !isDateSeed(data.seed) || data.seed <= jstToday());

export const pickGradeInputSchema = z
  .object({
    answer: z.number().int().min(0).max(3),
    mode: z.enum(["easy", "hard"]),
    n: z.number().int().min(1),
    seed: z.string().min(1).max(100),
  })
  .refine((data) => isModeSeedAllowed(data.mode, data.seed))
  .refine((data) => data.n <= questionCountFor(data.mode))
  .refine((data) => !isDateSeed(data.seed) || data.seed <= jstToday());
