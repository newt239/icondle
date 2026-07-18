import { createFileRoute } from "@tanstack/react-router";

import { buildQuestionRoute } from "#/routes/-question-route";

export const Route = createFileRoute("/pick/hard/$seed/$n")(
  buildQuestionRoute("pick", "hard", "/pick/hard/$seed/$n"),
);
