import { useState } from "react";

import { Button } from "@heroui/react";

type ShareButtonProps = {
  text: string;
  path: string;
};

export const ShareButton = ({ text, path }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(`${text}\n${window.location.origin}${path}`).then(() => {
      setCopied(true);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Button onPress={copy} variant="primary">
        結果をコピーして共有
      </Button>
      <span aria-live="polite" className="text-muted text-sm">
        {copied ? "コピーしました" : ""}
      </span>
    </div>
  );
};
