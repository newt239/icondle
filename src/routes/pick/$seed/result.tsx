import { createFileRoute } from "@tanstack/react-router";

import { buildResultRoute } from "#/routes/-result-route";

export const Route = createFileRoute("/pick/$seed/result")(
  buildResultRoute("pick", "easy", "/pick/$seed/result"),
);
