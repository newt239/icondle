import { Card } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import { quizBasePath, shareLabelFor } from "#/lib/quiz-config";

import type { PlayHistoryEntry } from "#/lib/quiz-history";

type PlayHistoryItemProps = {
  entry: PlayHistoryEntry;
};

const formatPlayedAt = (playedAt: number): string =>
  new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(new Date(playedAt));

export const PlayHistoryItem = ({ entry }: PlayHistoryItemProps) => (
  <Card<"a">
    className="group focus-visible:outline-focus flex-row items-center gap-3 p-4 transition-shadow outline-none hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
    render={(props) => (
      <Link
        {...props}
        params={{ seed: entry.seed }}
        search={{ a: entry.answers }}
        to={`${quizBasePath(entry.game, entry.mode)}/$seed/result`}
      />
    )}
  >
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="font-medium">{shareLabelFor(entry.game, entry.mode, entry.seed)}</span>
      <span className="text-muted text-xs">{formatPlayedAt(entry.playedAt)}</span>
    </div>
    <span className="font-bold">
      {entry.score} / {entry.total}
    </span>
  </Card>
);
