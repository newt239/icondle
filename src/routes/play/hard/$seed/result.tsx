import { createFileRoute } from "@tanstack/react-router";

import { buildResultRoute } from "#/routes/-result-route";

export const Route = createFileRoute("/play/hard/$seed/result")(
  buildResultRoute("play", "hard", "/play/hard/$seed/result"),
);
