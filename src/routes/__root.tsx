import type { ReactNode } from "react";

import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "#/styles.css?url";

const RootDocument = ({ children }: { children: ReactNode }) => (
  <html className="bg-background bg-grid-pattern" data-theme="sky" lang="ja">
    <head>
      <HeadContent />
    </head>
    <body className="text-foreground antialiased">
      <div className="min-h-dvh p-1.5 sm:p-3 lg:p-6">
        <div className="border-border bg-background mx-auto flex min-h-[calc(100dvh-0.75rem)] w-full max-w-2xl flex-col rounded-2xl border sm:min-h-[calc(100dvh-1.5rem)] lg:min-h-[calc(100dvh-3rem)]">
          {children}
        </div>
      </div>
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
