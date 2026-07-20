import { createFileRoute } from "@tanstack/react-router";

import { buildShareRoute } from "#/routes/-share-route";

export const Route = createFileRoute("/pick/hard/$seed/share/")(
  buildShareRoute("pick", "hard", "/pick/hard/$seed/share/"),
);
