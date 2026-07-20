import { getRouteApi, notFound } from "@tanstack/react-router";

import { ShareRedirectPage } from "#/features/result/components/share-redirect-page";
import {
  createShareHead,
  createShareOgImageResponse,
  loadShareResult,
} from "#/features/result/lib/share-result";
import { isSeedPlayable, type QuizGame, type QuizMode } from "#/lib/quiz";
import { quizSearchSchema } from "#/schemas";

type ShareRoutePath =
  | "/pick/$seed/share/"
  | "/pick/hard/$seed/share/"
  | "/play/$seed/share/"
  | "/play/hard/$seed/share/";

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const buildShareRoute = (game: QuizGame, mode: QuizMode, path: ShareRoutePath) => {
  const routeApi = getRouteApi(path);
  const ShareRoute = () => {
    const { result, seed } = routeApi.useLoaderData();
    return <ShareRedirectPage game={game} mode={mode} result={result} seed={seed} />;
  };
  return {
    component: ShareRoute,
    head: createShareHead,
    loader: async ({ deps, params }: { deps: { a: string }; params: { seed: string } }) => {
      if (!isSeedPlayable(game, mode, params.seed)) {
        throw notFound();
      }
      return await loadShareResult({ answers: deps.a, game, mode, seed: params.seed });
    },
    loaderDeps,
    validateSearch: quizSearchSchema,
  };
};

export const buildShareOgRoute = (game: QuizGame, mode: QuizMode) => ({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { seed: string }; request: Request }) => {
        const answers = new URL(request.url).searchParams.get("a") ?? "";
        return await createShareOgImageResponse({ answers, game, mode, seed: params.seed });
      },
    },
  },
});
