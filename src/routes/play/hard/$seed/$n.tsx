import { createFileRoute } from "@tanstack/react-router";

import { buildQuestionRoute } from "#/routes/-question-route";

export const Route = createFileRoute("/play/hard/$seed/$n")(
  buildQuestionRoute("play", "hard", "/play/hard/$seed/$n"),
);
