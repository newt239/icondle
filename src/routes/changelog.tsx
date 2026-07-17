import { createFileRoute } from "@tanstack/react-router";

import { ChangelogPage } from "#/features/changelog/components/changelog-page";
import { buildPageHead } from "#/lib/page-head";

export const Route = createFileRoute("/changelog")({
  component: ChangelogPage,
  head: () =>
    buildPageHead({
      description: "Icondleのバージョンごとの更新履歴です。",
      path: "/changelog",
      title: "更新履歴",
    }),
});
