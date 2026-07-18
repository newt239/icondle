import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { pickQuestionInputSchema } from "#/features/pick-question/schemas";

import type { PickClientQuestion } from "#/types";

export const getPickQuestion = createServerFn({ method: "GET" })
  .validator(pickQuestionInputSchema)
  .handler(async ({ data }): Promise<PickClientQuestion> => {
    setResponseHeader("cache-control", "private, no-store");
    const { dealPickQuestion } = await import("#/lib/deal.server");
    return dealPickQuestion(data.mode, data.seed, data.n);
  });
