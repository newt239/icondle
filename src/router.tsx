import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

const parseSearch = (searchStr: string): Record<string, string> =>
  Object.fromEntries(new URLSearchParams(searchStr));

const stringifySearch = (search: Record<string, unknown>): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (typeof value === "string" && value !== "") {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return query === "" ? "" : `?${query}`;
};

export const getRouter = () =>
  createRouter({
    parseSearch,
    routeTree,
    scrollRestoration: true,
    stringifySearch,
  });

declare module "@tanstack/react-router" {
  // 宣言マージによるルーター型の登録には interface が必須のため例外的に使用する
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
