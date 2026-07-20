import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import type { SetOverview } from "#/types";

export const getSetsOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<SetOverview[]> => {
    setResponseHeader("cache-control", "no-store");
    const { createSetsOverview } = await import("./sets.server");
    return createSetsOverview();
  },
);
