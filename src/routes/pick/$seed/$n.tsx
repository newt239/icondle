import { createFileRoute } from "@tanstack/react-router";

import { buildQuestionRoute } from "#/routes/-question-route";

export const Route = createFileRoute("/pick/$seed/$n")(
  buildQuestionRoute("pick", "easy", "/pick/$seed/$n"),
);
