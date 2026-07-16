import { createFileRoute, notFound } from "@tanstack/react-router";

import { ResultPage } from "#/features/result/components/result-page";
import { getRunResult } from "#/features/result/lib/run-result";
import { isDateSeed } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const PickHardResult = () => {
  const { seed } = Route.useParams();
  const result = Route.useLoaderData();
  return (
    <ResultPage
      replayTo="/pick/hard"
      result={result}
      shareLabel="Icondle Pick Hard"
      sharePath={`/pick/hard/${seed}/1`}
    />
  );
};

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const Route = createFileRoute("/pick/hard/$seed/result")({
  component: PickHardResult,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: async ({ deps, params }) => {
    if (isDateSeed(params.seed)) {
      throw notFound();
    }
    return await getRunResult({
      data: { answers: deps.a, game: "pick", mode: "hard", seed: params.seed },
    });
  },
  loaderDeps,
  validateSearch: quizSearchSchema,
});
