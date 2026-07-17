import { createFileRoute } from "@tanstack/react-router";

import { PrivacyPage } from "#/features/privacy/components/privacy-page";
import { buildPageHead } from "#/lib/page-head";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () =>
    buildPageHead({
      description:
        "Icondleにおける Google Analytics の利用目的や第三者提供についてのプライバシーポリシーです。",
      path: "/privacy",
      title: "プライバシーポリシー",
    }),
});
