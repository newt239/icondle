import { createFileRoute } from "@tanstack/react-router";

import { buildShareRoute } from "#/routes/-share-route";

export const Route = createFileRoute("/play/$seed/share/")(
  buildShareRoute("play", "easy", "/play/$seed/share/"),
);
