import { createFileRoute } from "@tanstack/react-router";

import { buildResultRoute } from "#/routes/-result-route";

export const Route = createFileRoute("/play/$seed/result")(
  buildResultRoute("play", "easy", "/play/$seed/result"),
);
