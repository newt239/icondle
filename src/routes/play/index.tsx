import { createFileRoute, redirect } from "@tanstack/react-router";

import { generateSeed } from "#/lib/config";

export const Route = createFileRoute("/play/")({
  beforeLoad: () => {
    throw redirect({
      params: { n: "1", seed: generateSeed() },
      statusCode: 302,
      to: "/play/$seed/$n",
    });
  },
});
