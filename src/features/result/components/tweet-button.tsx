import { Button } from "@heroui/react";

type TweetButtonProps = {
  text: string;
  path: string;
};

export const TweetButton = ({ text, path }: TweetButtonProps) => {
  const openTweet = () => {
    const url = `${window.location.origin}${path}`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  };

  return (
    <Button onPress={openTweet} variant="secondary">
      Xでポストする
    </Button>
  );
};
