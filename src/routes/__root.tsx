import type { ReactNode } from "react";

import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "#/styles.css?url";

const RootDocument = ({ children }: { children: ReactNode }) => (
  <html className="bg-background" data-theme="sky" lang="ja">
    <head>
      <HeadContent />
    </head>
    <body className="text-foreground antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden lg:block"
      >
        <div className="bg-accent/25 absolute -top-40 -left-40 size-[32rem] rounded-full blur-3xl" />
        <div className="bg-accent/15 absolute top-1/3 -right-48 size-[28rem] rounded-full blur-3xl" />
        <div className="bg-accent/10 absolute -bottom-48 left-1/4 size-[26rem] rounded-full blur-3xl" />
      </div>
      {children}
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRoute({
  head: () => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      { href: "/favicon.ico", rel: "icon" },
    ],
    meta: [
      { charSet: "utf8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: "Guess Icon" },
    ],
  }),
  shellComponent: RootDocument,
});
