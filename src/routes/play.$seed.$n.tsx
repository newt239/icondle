import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { QuestionPage } from "#/features/question/components/question-page";
import { getQuestion } from "#/lib/question";
import { isDateSeed, jstToday, questionCountFor } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const PlayQuestion = () => {
  const { seed, n } = Route.useParams();
  const { a } = Route.useSearch();
  const question = Route.useLoaderData();
  return (
    <QuestionPage
      answers={a ?? ""}
      key={`${seed}:${n}`}
      n={Number(n)}
      question={question}
      seed={seed}
      total={questionCountFor(seed)}
    />
  );
};

export const Route = createFileRoute("/play/$seed/$n")({
  component: PlayQuestion,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: ({ params }) => {
    const parsed = z.coerce
      .number()
      .int()
      .min(1)
      .max(questionCountFor(params.seed))
      .safeParse(params.n);
    if (!parsed.success || (isDateSeed(params.seed) && params.seed > jstToday())) {
      throw notFound();
    }
    return getQuestion({ data: { n: parsed.data, seed: params.seed } });
  },
  validateSearch: quizSearchSchema,
});
