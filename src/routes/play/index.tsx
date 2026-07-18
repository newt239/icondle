import { createFileRoute } from "@tanstack/react-router";

import { buildQuizStartRoute } from "#/routes/-question-route";

export const Route = createFileRoute("/play/")(buildQuizStartRoute("/play/$seed/$n"));
