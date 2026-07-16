import { createFileRoute, notFound } from "@tanstack/react-router";

import { ResultPage } from "#/features/result/components/result-page";
import { getRunResult } from "#/features/result/lib/run-result";
import { isDateSeed } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const PlayHardResult = () => {
  const { seed } = Route.useParams();
  const result = Route.useLoaderData();
  return (
    <ResultPage
      mode="hard"
      result={result}
      shareLabel="Guess Icon Hard"
      sharePath={`/play/hard/${seed}/1`}
    />
  );
};

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const Route = createFileRoute("/play/hard/$seed/result")({
  component: PlayHardResult,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: ({ deps, params }) => {
    if (isDateSeed(params.seed)) {
      throw notFound();
    }
    return getRunResult({ data: { answers: deps.a, mode: "hard", seed: params.seed } });
  },
  loaderDeps,
  validateSearch: quizSearchSchema,
});
