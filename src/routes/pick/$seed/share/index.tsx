import { createFileRoute, notFound } from "@tanstack/react-router";

import { ShareRedirectPage } from "#/features/result/components/share-redirect-page";
import { createShareHead, loadShareResult } from "#/features/result/lib/share-result";
import { isDateSeed, jstToday } from "#/lib/config";
import { quizSearchSchema } from "#/schemas";

const PickShare = () => {
  const { result, seed } = Route.useLoaderData();
  return <ShareRedirectPage game="pick" mode="easy" result={result} seed={seed} />;
};

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const Route = createFileRoute("/pick/$seed/share/")({
  component: PickShare,
  head: createShareHead,
  loader: async ({ deps, params }) => {
    if (isDateSeed(params.seed) && params.seed > jstToday()) {
      throw notFound();
    }
    return await loadShareResult({
      answers: deps.a,
      game: "pick",
      mode: "easy",
      seed: params.seed,
    });
  },
  loaderDeps,
  validateSearch: quizSearchSchema,
});
