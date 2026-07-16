import { Card, EmptyState } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import { ShareButton } from "./share-button";

import type { RunResult } from "#/lib/quiz-types";

type ResultPageProps = {
  replayTo: "/play" | "/play/hard" | "/pick" | "/pick/hard";
  result: RunResult;
  shareLabel: string;
  sharePath: string;
};

const linkClassName =
  "rounded-full bg-neutral-900 px-6 py-2 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900";

export const ResultPage = ({ replayTo, result, shareLabel, sharePath }: ResultPageProps) => {
  if (!result.success) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-6 px-4 py-8">
        <EmptyState className="gap-4">
          <h1 className="text-xl font-bold">結果を表示できません</h1>
          <p className="text-neutral-500">{result.error}</p>
          <Link className={linkClassName} to={replayTo}>
            最初から遊ぶ
          </Link>
        </EmptyState>
      </main>
    );
  }

  const emojiRow = result.items.map((item) => (item.correct ? "🟩" : "❌")).join("");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <Link className="text-xl font-bold" to="/">
          Guess Icon
        </Link>
      </header>
      <h1 className="text-2xl font-bold">
        結果: {result.score} / {result.total} 問正解
      </h1>
      <p aria-hidden="true" className="text-2xl tracking-widest">
        {emojiRow}
      </p>
      <ul className="flex flex-col gap-3">
        {result.items.map((item) => (
          <li key={item.n}>
            <Card className="flex-row items-center gap-3 p-4">
              <span aria-hidden="true">{item.correct ? "⭕" : "❌"}</span>
              <span className="sr-only">{item.correct ? "正解" : "不正解"}</span>
              <span className="font-medium">第{item.n}問</span>
              <a
                className="truncate text-neutral-500 underline underline-offset-2"
                href={`https://icon-sets.iconify.design/${item.meta.setId}/${item.meta.icon}/`}
                rel="noreferrer"
                target="_blank"
              >
                {item.meta.set} の {item.meta.icon}
              </a>
            </Card>
          </li>
        ))}
      </ul>
      <ShareButton
        path={sharePath}
        text={`${shareLabel} ${result.score}/${result.total}\n${emojiRow}`}
      />
      <div className="flex gap-4">
        <Link className={linkClassName} to={replayTo}>
          もう一度遊ぶ
        </Link>
      </div>
    </main>
  );
};
