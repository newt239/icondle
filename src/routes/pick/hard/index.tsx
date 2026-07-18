import { createFileRoute } from "@tanstack/react-router";

import { buildQuizStartRoute } from "#/routes/-question-route";

export const Route = createFileRoute("/pick/hard/")(buildQuizStartRoute("/pick/hard/$seed/$n"));
