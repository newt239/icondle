import { createFileRoute } from "@tanstack/react-router";

import { SetsPage } from "#/features/sets/components/sets-page";
import { getSetsOverview } from "#/features/sets/lib/sets";
import { createPageHeadObject } from "#/lib/meta";

const Sets = () => {
  const sets = Route.useLoaderData();
  return <SetsPage sets={sets} />;
};

export const Route = createFileRoute("/sets")({
  component: Sets,
  head: () =>
    createPageHeadObject({
      description:
        "Icondleに収録されている全アイコンセットのグリッドサイズ・アイコン数・ライセンスを一覧できます。",
      path: "/sets",
      title: "収録アイコンセット一覧",
    }),
  loader: async () => await getSetsOverview(),
});
