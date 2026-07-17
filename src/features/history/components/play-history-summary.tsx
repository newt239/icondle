import { Link } from "@tanstack/react-router";

import { usePlayHistory } from "#/hooks/use-play-history";

import { PlayHistoryItem } from "./play-history-item";

const SUMMARY_LIMIT = 3;

export const PlayHistorySummary = () => {
  const history = usePlayHistory();

  if (history.length === 0) {
    return null;
  }

  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">最近のプレイ履歴</h2>
        <Link className="text-muted text-sm underline underline-offset-2" to="/history">
          すべて見る
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {history.slice(0, SUMMARY_LIMIT).map((entry) => (
          <li key={`${entry.game}:${entry.mode}:${entry.seed}`}>
            <PlayHistoryItem entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
};
