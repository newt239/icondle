import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { PickQuestionPage } from "#/features/pick-question/components/pick-question-page";
import { getPickQuestion } from "#/features/pick-question/lib/pick-question";
import { isDateSeed, PLAY_QUESTION_COUNT } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const PickHardQuestion = () => {
  const { seed, n } = Route.useParams();
  const { a } = Route.useSearch();
  const question = Route.useLoaderData();
  return (
    <PickQuestionPage
      answers={a ?? ""}
      key={`pick:hard:${seed}:${n}`}
      mode="hard"
      n={Number(n)}
      question={question}
      seed={seed}
      total={PLAY_QUESTION_COUNT}
    />
  );
};

export const Route = createFileRoute("/pick/hard/$seed/$n")({
  component: PickHardQuestion,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: async ({ params }) => {
    const parsed = z.coerce.number().int().min(1).max(PLAY_QUESTION_COUNT).safeParse(params.n);
    if (!parsed.success || isDateSeed(params.seed)) {
      throw notFound();
    }
    return await getPickQuestion({ data: { mode: "hard", n: parsed.data, seed: params.seed } });
  },
  validateSearch: quizSearchSchema,
});
