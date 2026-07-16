import { createFileRoute, notFound } from "@tanstack/react-router";

import { ShareRedirectPage } from "#/features/result/components/share-redirect-page";
import { buildShareHead, loadShareResult } from "#/features/result/lib/share-result";
import { isDateSeed } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const PlayHardShare = () => {
  const { result, seed } = Route.useLoaderData();
  return <ShareRedirectPage game="play" mode="hard" result={result} seed={seed} />;
};

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const Route = createFileRoute("/play/hard/$seed/share/")({
  component: PlayHardShare,
  head: buildShareHead,
  loader: async ({ deps, params }) => {
    if (isDateSeed(params.seed)) {
      throw notFound();
    }
    return await loadShareResult({
      answers: deps.a,
      game: "play",
      mode: "hard",
      seed: params.seed,
    });
  },
  loaderDeps,
  validateSearch: quizSearchSchema,
});
