import { createFileRoute } from "@tanstack/react-router";

import { buildShareOgRoute } from "#/routes/-share-route";

export const Route = createFileRoute("/play/hard/$seed/share/og")(
  buildShareOgRoute("play", "hard"),
);
