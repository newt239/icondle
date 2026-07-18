import { createFileRoute, redirect } from "@tanstack/react-router";

import { generateSeed } from "#/lib/quiz";

export const Route = createFileRoute("/pick/hard/")({
  beforeLoad: () => {
    throw redirect({
      params: { n: "1", seed: generateSeed() },
      statusCode: 302,
      to: "/pick/hard/$seed/$n",
    });
  },
});
