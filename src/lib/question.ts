import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import {
  isDateSeed,
  isModeSeedAllowed,
  jstToday,
  PLAY_QUESTION_COUNT,
  questionCountFor,
} from "./quiz-config";

import type { ClientQuestion } from "./quiz-types";

export const questionInputSchema = z
  .object({
    mode: z.enum(["easy", "hard"]),
    n: z.number().int().min(1).max(PLAY_QUESTION_COUNT),
    seed: z.string().min(1).max(100),
  })
  .refine((data) => isModeSeedAllowed(data.mode, data.seed))
  .refine((data) => data.n <= questionCountFor(data.seed))
  .refine((data) => !isDateSeed(data.seed) || data.seed <= jstToday());

export const getQuestion = createServerFn({ method: "GET" })
  .validator(questionInputSchema)
  .handler(async ({ data }): Promise<ClientQuestion> => {
    setResponseHeader("cache-control", "private, no-store");
    const { dealQuestion } = await import("./deal.server");
    return dealQuestion(data.mode, data.seed, data.n);
  });
