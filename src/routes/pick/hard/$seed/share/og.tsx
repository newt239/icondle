import { createFileRoute } from "@tanstack/react-router";

import { buildShareOgRoute } from "#/routes/-share-route";

export const Route = createFileRoute("/pick/hard/$seed/share/og")(
  buildShareOgRoute("pick", "hard"),
);
