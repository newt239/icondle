import { createFileRoute } from "@tanstack/react-router";

import { ChangelogPage } from "#/features/changelog/components/changelog-page";

export const Route = createFileRoute("/changelog")({
  component: ChangelogPage,
});
