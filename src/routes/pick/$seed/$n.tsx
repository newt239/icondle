import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { PickQuestionPage } from "#/features/pick-question/components/pick-question-page";
import { getPickQuestion } from "#/features/pick-question/lib/pick-question";
import { jstToday } from "#/lib/date";
import { isDateSeed, quizConfig } from "#/lib/quiz";
import { quizSearchSchema } from "#/schemas";

const PickQuestion = () => {
  const { seed, n } = Route.useParams();
  const { a } = Route.useSearch();
  const question = Route.useLoaderData();
  return (
    <PickQuestionPage
      answers={a ?? ""}
      key={`pick:${seed}:${n}`}
      mode="easy"
      n={Number(n)}
      question={question}
      seed={seed}
      total={quizConfig.easy.questionCount}
    />
  );
};

export const Route = createFileRoute("/pick/$seed/$n")({
  component: PickQuestion,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: async ({ params }) => {
    const parsed = z.coerce
      .number()
      .int()
      .min(1)
      .max(quizConfig.easy.questionCount)
      .safeParse(params.n);
    if (!parsed.success || (isDateSeed(params.seed) && params.seed > jstToday())) {
      throw notFound();
    }
    return await getPickQuestion({ data: { mode: "easy", n: parsed.data, seed: params.seed } });
  },
  validateSearch: quizSearchSchema,
});
