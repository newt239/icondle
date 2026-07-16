import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { isDateSeed, questionCountFor } from "#/lib/quiz-config";

import type { ClientQuestion } from "#/lib/quiz-types";

export const questionInputSchema = z
  .object({
    mode: z.enum(["easy", "hard"]),
    n: z.number().int().min(1),
    seed: z.string().min(1).max(100),
  })
  .refine((data) => !isDateSeed(data.seed))
  .refine((data) => data.n <= questionCountFor(data.mode));

export const getQuestion = createServerFn({ method: "GET" })
  .validator(questionInputSchema)
  .handler(async ({ data }): Promise<ClientQuestion> => {
    setResponseHeader("cache-control", "private, no-store");
    const { dealQuestion } = await import("#/lib/deal.server");
    return dealQuestion(data.mode, data.seed, data.n);
  });
