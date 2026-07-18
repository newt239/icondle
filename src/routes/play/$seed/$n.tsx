import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { QuestionPage } from "#/features/question/components/question-page";
import { getQuestion } from "#/features/question/lib/question";
import { isDateSeed, questionCountFor } from "#/lib/config";
import { quizSearchSchema } from "#/schemas";

const PlayQuestion = () => {
  const { seed, n } = Route.useParams();
  const { a } = Route.useSearch();
  const question = Route.useLoaderData();
  return (
    <QuestionPage
      answers={a ?? ""}
      key={`${seed}:${n}`}
      mode="easy"
      n={Number(n)}
      question={question}
      seed={seed}
      total={questionCountFor("easy")}
    />
  );
};

export const Route = createFileRoute("/play/$seed/$n")({
  component: PlayQuestion,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: async ({ params }) => {
    const parsed = z.coerce.number().int().min(1).max(questionCountFor("easy")).safeParse(params.n);
    if (!parsed.success || isDateSeed(params.seed)) {
      throw notFound();
    }
    return await getQuestion({ data: { mode: "easy", n: parsed.data, seed: params.seed } });
  },
  validateSearch: quizSearchSchema,
});
