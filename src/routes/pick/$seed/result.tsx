import { createFileRoute, notFound } from "@tanstack/react-router";

import { ResultPage } from "#/features/result/components/result-page";
import { getRunResult } from "#/features/result/lib/run-result";
import { isDateSeed, jstToday } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const PickResult = () => {
  const { seed } = Route.useParams();
  const result = Route.useLoaderData();
  const shareLabel = isDateSeed(seed) ? `Icondle Daily ${seed}` : "Icondle Pick";
  return (
    <ResultPage
      replayTo="/pick"
      result={result}
      shareLabel={shareLabel}
      sharePath={`/pick/${seed}/1`}
    />
  );
};

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const Route = createFileRoute("/pick/$seed/result")({
  component: PickResult,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: async ({ deps, params }) => {
    if (isDateSeed(params.seed) && params.seed > jstToday()) {
      throw notFound();
    }
    return await getRunResult({
      data: { answers: deps.a, game: "pick", mode: "easy", seed: params.seed },
    });
  },
  loaderDeps,
  validateSearch: quizSearchSchema,
});
