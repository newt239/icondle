import { createFileRoute } from "@tanstack/react-router";

import { buildResultRoute } from "#/routes/-result-route";

export const Route = createFileRoute("/pick/hard/$seed/result")(
  buildResultRoute("pick", "hard", "/pick/hard/$seed/result"),
);
