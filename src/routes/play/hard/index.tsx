import { createFileRoute, redirect } from "@tanstack/react-router";

import { generateSeed } from "#/lib/quiz-config";

export const Route = createFileRoute("/play/hard/")({
  beforeLoad: () => {
    throw redirect({
      params: { n: "1", seed: generateSeed() },
      statusCode: 302,
      to: "/play/hard/$seed/$n",
    });
  },
});
