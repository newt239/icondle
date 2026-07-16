import { createFileRoute, notFound } from "@tanstack/react-router";

import { ResultPage } from "#/features/result/components/result-page";
import { getRunResult } from "#/lib/grade";
import { isDateSeed, jstToday } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const PlayResult = () => {
  const { seed } = Route.useParams();
  const result = Route.useLoaderData();
  const shareLabel = isDateSeed(seed) ? `Guess Icon Daily ${seed}` : "Guess Icon";
  return <ResultPage result={result} shareLabel={shareLabel} sharePath={`/play/${seed}/1`} />;
};

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const Route = createFileRoute("/play/$seed/result")({
  component: PlayResult,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: ({ deps, params }) => {
    if (isDateSeed(params.seed) && params.seed > jstToday()) {
      throw notFound();
    }
    return getRunResult({ data: { answers: deps.a, seed: params.seed } });
  },
  loaderDeps,
  validateSearch: quizSearchSchema,
});
