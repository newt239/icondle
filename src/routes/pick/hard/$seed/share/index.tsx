import { createFileRoute, notFound } from "@tanstack/react-router";

import { ShareRedirectPage } from "#/features/result/components/share-redirect-page";
import { createShareHead, loadShareResult } from "#/features/result/lib/share-result";
import { isSeedPlayable } from "#/lib/quiz";
import { quizSearchSchema } from "#/schemas";

const RouteComponent = () => {
  const { result, seed } = Route.useLoaderData();
  return <ShareRedirectPage game="pick" mode="hard" result={result} seed={seed} />;
};

export const Route = createFileRoute("/pick/hard/$seed/share/")({
  component: RouteComponent,
  head: createShareHead,
  loader: async ({ deps, params }) => {
    if (!isSeedPlayable("pick", "hard", params.seed)) {
      throw notFound();
    }
    return await loadShareResult({
      answers: deps.a,
      game: "pick",
      mode: "hard",
      seed: params.seed,
    });
  },
  loaderDeps: ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" }),
  validateSearch: quizSearchSchema,
});
