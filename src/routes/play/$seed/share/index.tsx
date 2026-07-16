import { createFileRoute, notFound } from "@tanstack/react-router";

import { ShareRedirectPage } from "#/features/result/components/share-redirect-page";
import { buildShareHead, loadShareResult } from "#/features/result/lib/share-result";
import { isDateSeed } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const PlayShare = () => {
  const { result, seed } = Route.useLoaderData();
  return <ShareRedirectPage game="play" mode="easy" result={result} seed={seed} />;
};

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const Route = createFileRoute("/play/$seed/share/")({
  component: PlayShare,
  head: buildShareHead,
  loader: async ({ deps, params }) => {
    if (isDateSeed(params.seed)) {
      throw notFound();
    }
    return await loadShareResult({
      answers: deps.a,
      game: "play",
      mode: "easy",
      seed: params.seed,
    });
  },
  loaderDeps,
  validateSearch: quizSearchSchema,
});
