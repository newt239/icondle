export const SITE_URL = "https://icondle.newt239.dev";
export const SITE_NAME = "Icondle";
export const SITE_DESCRIPTION =
  "UIアイコンライブラリの識別クイズ。表示されたアイコンからセット名を、セット名から合うアイコンを4択で当てよう。";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

type PageHeadInput = {
  description: string;
  path: string;
  title: string;
};

export const createPageHeadObject = ({ description, path, title }: PageHeadInput) => {
  const fullTitle = `${title} - ${SITE_NAME}`;
  return {
    links: [{ href: `${SITE_URL}${path}`, rel: "canonical" }],
    meta: [
      { title: fullTitle },
      { content: description, name: "description" },
      { content: fullTitle, property: "og:title" },
      { content: description, property: "og:description" },
      { content: fullTitle, name: "twitter:title" },
      { content: description, name: "twitter:description" },
    ],
  };
};
