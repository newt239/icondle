import { z } from "zod";

import { isDateSeed, questionCountFor } from "#/lib/config";

export const questionInputSchema = z
  .object({
    mode: z.enum(["easy", "hard"]),
    n: z.number().int().min(1),
    seed: z.string().min(1).max(100),
  })
  .refine((data) => !isDateSeed(data.seed))
  .refine((data) => data.n <= questionCountFor(data.mode));

export const gradeInputSchema = z
  .object({
    answer: z.number().int().min(0).max(3),
    mode: z.enum(["easy", "hard"]),
    n: z.number().int().min(1),
    seed: z.string().min(1).max(100),
  })
  .refine((data) => !isDateSeed(data.seed))
  .refine((data) => data.n <= questionCountFor(data.mode));
