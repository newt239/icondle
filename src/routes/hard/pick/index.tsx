import { createFileRoute, redirect } from "@tanstack/react-router";

import { generateSeed } from "#/lib/quiz";

export const Route = createFileRoute("/hard/pick/")({
  beforeLoad: () => {
    throw redirect({
      params: { n: "1", seed: generateSeed() },
      statusCode: 302,
      to: "/hard/pick/$seed/$n",
    });
  },
});
