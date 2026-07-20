import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { questionInputSchema } from "#/features/question/schemas";

import type { QuizQuestion } from "#/types";

export const getQuestion = createServerFn({ method: "GET" })
  .validator(questionInputSchema)
  .handler(async ({ data }): Promise<QuizQuestion> => {
    setResponseHeader("cache-control", "private, no-store");
    const { dealPickQuestion, dealQuestion } = await import("#/lib/deal.server");
    return data.game === "play"
      ? { game: "play", ...dealQuestion(data.mode, data.seed, data.n) }
      : { game: "pick", ...dealPickQuestion(data.mode, data.seed, data.n) };
  });
