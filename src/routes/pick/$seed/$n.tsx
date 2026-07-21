import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { QuestionPage } from "#/features/question/components/question-page";
import { getQuestion } from "#/features/question/lib/question";
import { isSeedPlayable, quizConfig } from "#/lib/quiz";
import { quizSearchSchema } from "#/schemas";

const RouteComponent = () => {
  const { n, seed } = Route.useParams();
  const { a } = Route.useSearch();
  const question = Route.useLoaderData();
  return (
    <QuestionPage
      answers={a ?? ""}
      key={`pick:easy:${seed}:${n}`}
      mode="easy"
      n={Number(n)}
      question={question}
      seed={seed}
      total={quizConfig.easy.questionCount}
    />
  );
};

export const Route = createFileRoute("/pick/$seed/$n")({
  component: RouteComponent,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: async ({ params }) => {
    const parsed = z.coerce
      .number()
      .int()
      .min(1)
      .max(quizConfig.easy.questionCount)
      .safeParse(params.n);
    if (!parsed.success || !isSeedPlayable("pick", "easy", params.seed)) {
      throw notFound();
    }
    return await getQuestion({
      data: { game: "pick", mode: "easy", n: parsed.data, seed: params.seed },
    });
  },
  validateSearch: quizSearchSchema,
});
