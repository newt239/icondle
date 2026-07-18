import { createFileRoute } from "@tanstack/react-router";

import { buildShareOgRoute } from "#/routes/-share-route";

export const Route = createFileRoute("/pick/$seed/share/og")(buildShareOgRoute("pick", "easy"));
