import { createFileRoute } from "@tanstack/react-router";

import { buildQuizStartRoute } from "#/routes/-question-route";

export const Route = createFileRoute("/play/hard/")(buildQuizStartRoute("/play/hard/$seed/$n"));
