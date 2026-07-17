import { SITE_NAME, SITE_URL } from "#/lib/site-config";

type PageHeadInput = {
  description: string;
  path: string;
  title: string;
};

export const buildPageHead = ({ description, path, title }: PageHeadInput) => {
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
