import type { ReactNode } from "react";

import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "#/styles.css?url";

const RootDocument = ({ children }: { children: ReactNode }) => (
  <html className="bg-background" data-theme="sky" lang="ja">
    <head>
      <HeadContent />
    </head>
    <body className="text-foreground antialiased">
      <div aria-hidden="true" className="bg-grid-pattern pointer-events-none fixed inset-0 -z-10" />
      <div className="px-1.5 sm:px-3 lg:px-6">
        <div className="border-border bg-background mx-auto flex min-h-dvh w-full max-w-2xl flex-col border-x">
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
