import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { isDateSeed, isModeSeedAllowed, jstToday, questionCountFor } from "#/lib/quiz-config";

import type { PickClientQuestion } from "#/lib/quiz-types";

export const pickQuestionInputSchema = z
  .object({
    mode: z.enum(["easy", "hard"]),
    n: z.number().int().min(1),
    seed: z.string().min(1).max(100),
  })
  .refine((data) => isModeSeedAllowed(data.mode, data.seed))
  .refine((data) => data.n <= questionCountFor(data.mode))
  .refine((data) => !isDateSeed(data.seed) || data.seed <= jstToday());

export const getPickQuestion = createServerFn({ method: "GET" })
  .validator(pickQuestionInputSchema)
  .handler(async ({ data }): Promise<PickClientQuestion> => {
    setResponseHeader("cache-control", "private, no-store");
    const { dealPickQuestion } = await import("#/lib/deal.server");
    return dealPickQuestion(data.mode, data.seed, data.n);
  });
