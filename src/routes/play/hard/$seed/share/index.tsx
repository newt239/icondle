import { createFileRoute } from "@tanstack/react-router";

import { buildShareRoute } from "#/routes/-share-route";

export const Route = createFileRoute("/play/hard/$seed/share/")(
  buildShareRoute("play", "hard", "/play/hard/$seed/share/"),
);
