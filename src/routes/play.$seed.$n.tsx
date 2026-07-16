import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { QuestionPage } from "#/features/question/components/question-page";
import { getQuestion } from "#/lib/question";
import { PLAY_QUESTION_COUNT } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const nSchema = z.coerce.number().int().min(1).max(PLAY_QUESTION_COUNT);

const PlayQuestion = () => {
  const { seed, n } = Route.useParams();
  const { a } = Route.useSearch();
  const question = Route.useLoaderData();
  return (
    <QuestionPage
      answers={a ?? ""}
      gradeSeed={seed}
      key={`${seed}:${n}`}
      n={Number(n)}
      question={question}
      slug={seed}
      total={PLAY_QUESTION_COUNT}
    />
  );
};

export const Route = createFileRoute("/play/$seed/$n")({
  component: PlayQuestion,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: ({ params }) => getQuestion({ data: { n: nSchema.parse(params.n), seed: params.seed } }),
  validateSearch: quizSearchSchema,
});
