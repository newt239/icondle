import { createFileRoute } from "@tanstack/react-router";

import { SetsPage } from "#/features/sets/components/sets-page";
import { getSetsOverview } from "#/features/sets/lib/sets";

const Sets = () => {
  const sets = Route.useLoaderData();
  return <SetsPage sets={sets} />;
};

export const Route = createFileRoute("/sets")({
  component: Sets,
  loader: async () => await getSetsOverview(),
});
