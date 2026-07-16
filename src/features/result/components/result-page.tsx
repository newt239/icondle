import { buttonVariants, Card, EmptyState } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import { ShareButton } from "./share-button";

import type { RunResult } from "#/lib/quiz-types";

type ResultPageProps = {
  replayTo: "/play" | "/play/hard" | "/pick" | "/pick/hard";
  result: RunResult;
  shareLabel: string;
  sharePath: string;
};

const linkClassName = buttonVariants({ variant: "primary" });

export const ResultPage = ({ replayTo, result, shareLabel, sharePath }: ResultPageProps) => {
  if (!result.success) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
        <EmptyState className="gap-4">
          <h1 className="text-xl font-bold">結果を表示できません</h1>
          <p className="text-muted">{result.error}</p>
          <Link className={linkClassName} to={replayTo}>
            最初から遊ぶ
          </Link>
        </EmptyState>
      </main>
    );
  }

  const emojiRow = result.items.map((item) => (item.correct ? "🟩" : "❌")).join("");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <Link className="text-xl font-bold" to="/">
          Icondle
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
              <span className="text-muted min-w-0 flex-1">
                {item.meta.set} の{" "}
                {item.meta.icons.map((icon, index) => (
                  <span key={icon.concept}>
                    {index > 0 && "・"}
                    <a
                      className="underline underline-offset-2"
                      href={`https://icon-sets.iconify.design/${item.meta.setId}/${icon.icon}/`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {icon.icon}
                    </a>
                  </span>
                ))}
              </span>
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
