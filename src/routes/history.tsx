import { createFileRoute } from "@tanstack/react-router";

import { HistoryPage } from "#/features/history/components/history-page";
import { buildPageHead } from "#/lib/page-head";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () =>
    buildPageHead({
      description: "自分のIcondleプレイ履歴と正答率を確認できます。",
      path: "/history",
      title: "プレイ履歴",
    }),
});
