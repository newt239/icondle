import { createFileRoute, notFound } from "@tanstack/react-router";

import { ResultPage } from "#/features/result/components/result-page";
import { getRunResult } from "#/features/result/lib/run-result";
import { isDateSeed } from "#/lib/config";
import { quizSearchSchema } from "#/schemas";

const PlayResult = () => {
  const { seed } = Route.useParams();
  const { a } = Route.useSearch();
  const result = Route.useLoaderData();
  return (
    <ResultPage
      answers={a ?? ""}
      game="play"
      mode="easy"
      replayTo="/play"
      result={result}
      seed={seed}
    />
  );
};

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const Route = createFileRoute("/play/$seed/result")({
  component: PlayResult,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: async ({ deps, params }) => {
    if (isDateSeed(params.seed)) {
      throw notFound();
    }
    return await getRunResult({
      data: { answers: deps.a, game: "play", mode: "easy", seed: params.seed },
    });
  },
  loaderDeps,
  validateSearch: quizSearchSchema,
});
