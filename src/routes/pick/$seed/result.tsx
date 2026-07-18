import { createFileRoute, notFound } from "@tanstack/react-router";

import { ResultPage } from "#/features/result/components/result-page";
import { getRunResult } from "#/features/result/lib/run-result";
import { jstToday } from "#/lib/date";
import { isDateSeed } from "#/lib/quiz";
import { quizSearchSchema } from "#/schemas";

const PickResult = () => {
  const { seed } = Route.useParams();
  const { a } = Route.useSearch();
  const result = Route.useLoaderData();
  return (
    <ResultPage
      answers={a ?? ""}
      game="pick"
      mode="easy"
      replayTo="/pick"
      result={result}
      seed={seed}
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
