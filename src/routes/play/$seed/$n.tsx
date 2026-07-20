import { createFileRoute } from "@tanstack/react-router";

import { buildQuestionRoute } from "#/routes/-question-route";

export const Route = createFileRoute("/play/$seed/$n")(
  buildQuestionRoute("play", "easy", "/play/$seed/$n"),
);
