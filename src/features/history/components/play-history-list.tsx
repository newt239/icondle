import { EmptyState } from "@heroui/react";

import { usePlayHistory } from "#/hooks/use-play-history";

import { PlayHistoryItem } from "./play-history-item";

export const PlayHistoryList = () => {
  const history = usePlayHistory();

  if (history.length === 0) {
    return (
      <EmptyState className="gap-2">
        <p className="text-muted">まだプレイ履歴がありません</p>
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {history.map((entry) => (
        <li key={`${entry.game}:${entry.mode}:${entry.seed}`}>
          <PlayHistoryItem entry={entry} />
        </li>
      ))}
    </ul>
  );
};
