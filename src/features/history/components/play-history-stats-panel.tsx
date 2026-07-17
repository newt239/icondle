import { Card } from "@heroui/react";

import { computePlayHistoryStats } from "#/features/history/lib/play-history-stats";
import { usePlayHistory } from "#/hooks/use-play-history";

import type { QuizGame, QuizMode } from "#/lib/quiz-config";

const gameLabel = (game: QuizGame): string =>
  game === "play" ? "セット名を当てる" : "アイコンを当てる";

const modeLabel = (mode: QuizMode): string => (mode === "hard" ? "ハード" : "ノーマル");

const formatRate = (rate: number): string => `${Math.round(rate * 100)}%`;

export const PlayHistoryStatsPanel = () => {
  const history = usePlayHistory();
  const stats = computePlayHistoryStats(history);

  return (
    <Card className="gap-4 p-6">
      <div className="flex gap-6">
        <div>
          <p className="text-muted text-xs">総プレイ回数</p>
          <p className="text-2xl font-bold">{stats.totalPlays}</p>
        </div>
        <div>
          <p className="text-muted text-xs">平均正答率</p>
          <p className="text-2xl font-bold">{formatRate(stats.averageScoreRate)}</p>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {stats.breakdown.map((item) => (
          <li
            className="flex items-center justify-between gap-4 text-sm"
            key={`${item.game}:${item.mode}`}
          >
            <span className="text-muted">
              {gameLabel(item.game)}・{modeLabel(item.mode)}
            </span>
            <span>
              {item.plays} 回・平均 {formatRate(item.averageScoreRate)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
};
