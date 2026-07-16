import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { PLAY_QUESTION_COUNT } from "./quiz-config";

import type { ClientQuestion } from "./quiz-types";

const questionInputSchema = z.object({
  n: z.number().int().min(1).max(PLAY_QUESTION_COUNT),
  seed: z.string().min(1).max(100),
});

export const getQuestion = createServerFn({ method: "GET" })
  .validator(questionInputSchema)
  .handler(async ({ data }): Promise<ClientQuestion> => {
    setResponseHeader("cache-control", "private, no-store");
    const { dealQuestion } = await import("./deal.server");
    return dealQuestion(data.seed, data.n);
  });
