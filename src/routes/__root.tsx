import type { ReactNode } from "react";

import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "#/lib/site-config";
import appCss from "#/styles.css?url";

const RootDocument = ({ children }: { children: ReactNode }) => (
  <html className="bg-background" data-theme="sky" lang="ja">
    <head>
      <HeadContent />
    </head>
    <body className="text-foreground antialiased">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="bg-grid-pattern absolute inset-0" />
        <div className="bg-icon-cells absolute inset-0" />
        <div className="bg-glow absolute inset-0" />
      </div>
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
      { href: "/favicon.svg", rel: "icon", type: "image/svg+xml" },
      { href: "/apple-touch-icon.png", rel: "apple-touch-icon" },
    ],
    meta: [
      { charSet: "utf8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: SITE_NAME },
      { content: SITE_DESCRIPTION, name: "description" },
      { content: SITE_NAME, property: "og:site_name" },
      { content: "website", property: "og:type" },
      { content: SITE_NAME, property: "og:title" },
      { content: SITE_DESCRIPTION, property: "og:description" },
      { content: DEFAULT_OG_IMAGE, property: "og:image" },
      { content: "1200", property: "og:image:width" },
      { content: "630", property: "og:image:height" },
      { content: "summary_large_image", name: "twitter:card" },
      { content: SITE_NAME, name: "twitter:title" },
      { content: SITE_DESCRIPTION, name: "twitter:description" },
      { content: DEFAULT_OG_IMAGE, name: "twitter:image" },
    ],
    scripts: [
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-210FRX6S6M",
      },
      {
        children: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-210FRX6S6M');`,
      },
    ],
  }),
  shellComponent: RootDocument,
});
