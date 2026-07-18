import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { questionInputSchema } from "#/features/question/schemas";

import type { ClientQuestion } from "#/types";

export const getQuestion = createServerFn({ method: "GET" })
  .validator(questionInputSchema)
  .handler(async ({ data }): Promise<ClientQuestion> => {
    setResponseHeader("cache-control", "private, no-store");
    const { dealQuestion } = await import("#/lib/deal.server");
    return dealQuestion(data.mode, data.seed, data.n);
  });
