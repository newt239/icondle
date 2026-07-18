import { createFileRoute, notFound } from "@tanstack/react-router";

import { ShareRedirectPage } from "#/features/result/components/share-redirect-page";
import { createShareHead, loadShareResult } from "#/features/result/lib/share-result";
import { isDateSeed } from "#/lib/config";
import { quizSearchSchema } from "#/schemas";

const PickHardShare = () => {
  const { result, seed } = Route.useLoaderData();
  return <ShareRedirectPage game="pick" mode="hard" result={result} seed={seed} />;
};

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const Route = createFileRoute("/pick/hard/$seed/share/")({
  component: PickHardShare,
  head: createShareHead,
  loader: async ({ deps, params }) => {
    if (isDateSeed(params.seed)) {
      throw notFound();
    }
    return await loadShareResult({
      answers: deps.a,
      game: "pick",
      mode: "hard",
      seed: params.seed,
    });
  },
  loaderDeps,
  validateSearch: quizSearchSchema,
});
