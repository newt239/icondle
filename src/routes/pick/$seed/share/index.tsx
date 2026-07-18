import { createFileRoute } from "@tanstack/react-router";

import { buildShareRoute } from "#/routes/-share-route";

export const Route = createFileRoute("/pick/$seed/share/")(
  buildShareRoute("pick", "easy", "/pick/$seed/share/"),
);
