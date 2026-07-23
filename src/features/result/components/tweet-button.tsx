import { buttonVariants } from "@heroui/react";

import { SITE_URL } from "#/lib/meta";

type TweetButtonProps = {
  text: string;
  path: string;
};

export const TweetButton = ({ text, path }: TweetButtonProps) => (
  <a
    className={buttonVariants({ variant: "secondary" })}
    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text}\n`)}&url=${encodeURIComponent(`${SITE_URL}${path}`)}`}
    rel="noreferrer"
    target="_blank"
  >
    Xでポストする
  </a>
);
