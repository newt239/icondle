import { createFileRoute } from "@tanstack/react-router";

import { ResultPage } from "#/features/result/components/result-page";
import { getRunResult } from "#/lib/grade";
import { PLAY_QUESTION_COUNT } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const PlayResult = () => {
  const { seed } = Route.useParams();
  const result = Route.useLoaderData();
  return <ResultPage result={result} shareLabel="Guess Icon" sharePath={`/play/${seed}/1`} />;
};

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const Route = createFileRoute("/play/$seed/result")({
  component: PlayResult,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: ({ deps, params }) =>
    getRunResult({ data: { answers: deps.a, seed: params.seed, total: PLAY_QUESTION_COUNT } }),
  loaderDeps,
  validateSearch: quizSearchSchema,
});
