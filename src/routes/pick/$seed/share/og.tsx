import { createFileRoute } from "@tanstack/react-router";

import { createShareOgImageResponse } from "#/features/result/lib/share-result";

export const Route = createFileRoute("/pick/$seed/share/og")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const answers = new URL(request.url).searchParams.get("a") ?? "";
        return await createShareOgImageResponse({
          answers,
          game: "pick",
          mode: "easy",
          seed: params.seed,
        });
      },
    },
  },
});
