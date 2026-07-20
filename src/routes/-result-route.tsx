import { getRouteApi, notFound } from "@tanstack/react-router";

import { ResultPage } from "#/features/result/components/result-page";
import { getRunResult } from "#/features/result/lib/run-result";
import { isSeedPlayable, quizConfig, type QuizGame, type QuizMode } from "#/lib/quiz";
import { quizSearchSchema } from "#/schemas";

type ResultRoutePath =
  | "/pick/$seed/result"
  | "/pick/hard/$seed/result"
  | "/play/$seed/result"
  | "/play/hard/$seed/result";

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const buildResultRoute = (game: QuizGame, mode: QuizMode, path: ResultRoutePath) => {
  const routeApi = getRouteApi(path);
  const ResultRoute = () => {
    const { seed } = routeApi.useParams();
    const { a } = routeApi.useSearch();
    const result = routeApi.useLoaderData();
    return (
      <ResultPage
        answers={a ?? ""}
        game={game}
        mode={mode}
        replayTo={quizConfig[mode].games[game].basePath}
        result={result}
        seed={seed}
      />
    );
  };
  return {
    component: ResultRoute,
    headers: () => ({ "cache-control": "private, no-store" }),
    loader: async ({ deps, params }: { deps: { a: string }; params: { seed: string } }) => {
      if (!isSeedPlayable(game, mode, params.seed)) {
        throw notFound();
      }
      return await getRunResult({ data: { answers: deps.a, game, mode, seed: params.seed } });
    },
    loaderDeps,
    validateSearch: quizSearchSchema,
  };
};
