import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { QuestionPage } from "#/features/question/components/question-page";
import { getQuestion } from "#/features/question/lib/question";
import { isDateSeed, PLAY_QUESTION_COUNT } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const PlayHardQuestion = () => {
  const { seed, n } = Route.useParams();
  const { a } = Route.useSearch();
  const question = Route.useLoaderData();
  return (
    <QuestionPage
      answers={a ?? ""}
      key={`hard:${seed}:${n}`}
      mode="hard"
      n={Number(n)}
      question={question}
      seed={seed}
      total={PLAY_QUESTION_COUNT}
    />
  );
};

export const Route = createFileRoute("/play/hard/$seed/$n")({
  component: PlayHardQuestion,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: async ({ params }) => {
    const parsed = z.coerce.number().int().min(1).max(PLAY_QUESTION_COUNT).safeParse(params.n);
    if (!parsed.success || isDateSeed(params.seed)) {
      throw notFound();
    }
    return await getQuestion({ data: { mode: "hard", n: parsed.data, seed: params.seed } });
  },
  validateSearch: quizSearchSchema,
});
