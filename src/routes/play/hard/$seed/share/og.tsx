import { createFileRoute } from "@tanstack/react-router";

import { buildShareOgResponse } from "#/features/result/lib/share-result";

export const Route = createFileRoute("/play/hard/$seed/share/og")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const answers = new URL(request.url).searchParams.get("a") ?? "";
        return await buildShareOgResponse({
          answers,
          game: "play",
          mode: "hard",
          seed: params.seed,
        });
      },
    },
  },
});
