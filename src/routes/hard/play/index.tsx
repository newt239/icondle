import { createFileRoute, redirect } from "@tanstack/react-router";

import { generateSeed } from "#/lib/quiz";

export const Route = createFileRoute("/hard/play/")({
  beforeLoad: () => {
    throw redirect({
      params: { n: "1", seed: generateSeed() },
      statusCode: 302,
      to: "/hard/play/$seed/$n",
    });
  },
});
