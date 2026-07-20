import { buttonVariants } from "@heroui/react";

import { SITE_URL } from "#/lib/meta";

type TweetButtonProps = {
  text: string;
  path: string;
};

export const TweetButton = ({ text, path }: TweetButtonProps) => {
  const fullText = `${text}\n\n${SITE_URL}${path}`;
  return (
    <a
      className={buttonVariants({ variant: "secondary" })}
      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`}
      rel="noreferrer"
      target="_blank"
    >
      Xでポストする
    </a>
  );
};
