import { createFileRoute } from "@tanstack/react-router";

import { buildQuizStartRoute } from "#/routes/-question-route";

export const Route = createFileRoute("/pick/")(buildQuizStartRoute("/pick/$seed/$n"));
