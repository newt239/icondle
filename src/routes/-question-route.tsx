import { getRouteApi, notFound, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { QuestionPage } from "#/features/question/components/question-page";
import { getQuestion } from "#/features/question/lib/question";
import { generateSeed, isSeedPlayable, quizConfig, type QuizGame, type QuizMode } from "#/lib/quiz";
import { quizSearchSchema } from "#/schemas";

type QuestionRoutePath =
  | "/pick/$seed/$n"
  | "/pick/hard/$seed/$n"
  | "/play/$seed/$n"
  | "/play/hard/$seed/$n";

export const buildQuestionRoute = (game: QuizGame, mode: QuizMode, path: QuestionRoutePath) => {
  const routeApi = getRouteApi(path);
  const QuestionRoute = () => {
    const { n, seed } = routeApi.useParams();
    const { a } = routeApi.useSearch();
    const question = routeApi.useLoaderData();
    return (
      <QuestionPage
        answers={a ?? ""}
        key={`${game}:${mode}:${seed}:${n}`}
        mode={mode}
        n={Number(n)}
        question={question}
        seed={seed}
        total={quizConfig[mode].questionCount}
      />
    );
  };
  return {
    component: QuestionRoute,
    headers: () => ({ "cache-control": "private, no-store" }),
    loader: async ({ params }: { params: { n: string; seed: string } }) => {
      const parsed = z.coerce
        .number()
        .int()
        .min(1)
        .max(quizConfig[mode].questionCount)
        .safeParse(params.n);
      if (!parsed.success || !isSeedPlayable(game, mode, params.seed)) {
        throw notFound();
      }
      return await getQuestion({ data: { game, mode, n: parsed.data, seed: params.seed } });
    },
    validateSearch: quizSearchSchema,
  };
};

export const buildQuizStartRoute = (to: QuestionRoutePath) => ({
  beforeLoad: () => {
    throw redirect({
      params: { n: "1", seed: generateSeed() },
      statusCode: 302,
      to,
    });
  },
});
