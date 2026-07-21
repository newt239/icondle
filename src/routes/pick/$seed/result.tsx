import { createFileRoute, notFound } from "@tanstack/react-router";

import { ResultPage } from "#/features/result/components/result-page";
import { getRunResult } from "#/features/result/lib/run-result";
import { isSeedPlayable } from "#/lib/quiz";
import { quizSearchSchema } from "#/schemas";

const RouteComponent = () => {
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

export const Route = createFileRoute("/pick/$seed/result")({
  component: RouteComponent,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: async ({ deps, params }) => {
    if (!isSeedPlayable("pick", "easy", params.seed)) {
      throw notFound();
    }
    return await getRunResult({
      data: { answers: deps.a, game: "pick", mode: "easy", seed: params.seed },
    });
  },
  loaderDeps: ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" }),
  validateSearch: quizSearchSchema,
});
