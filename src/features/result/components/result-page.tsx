import { buttonVariants, Card, EmptyState } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import { quizBasePath, shareLabelFor, type QuizGame, type QuizMode } from "#/lib/quiz-config";

import { ShareButton } from "./share-button";
import { TweetButton } from "./tweet-button";

import type { RunResult } from "#/lib/quiz-types";

type ResultPageProps = {
  answers: string;
  game: QuizGame;
  mode: QuizMode;
  replayTo: "/play" | "/play/hard" | "/pick" | "/pick/hard";
  result: RunResult;
  seed: string;
};

const linkClassName = buttonVariants({ variant: "primary" });

export const ResultPage = ({ answers, game, mode, replayTo, result, seed }: ResultPageProps) => {
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
        <Link className="text-muted text-sm underline underline-offset-2" to="/">
          ← トップに戻る
        </Link>
      </main>
    );
  }

  const emojiRow = result.items.map((item) => (item.correct ? "🟩" : "❌")).join("");
  const shareLabel = shareLabelFor(game, mode, seed);
  const sharePath = `${quizBasePath(game, mode)}/${seed}/share?a=${encodeURIComponent(answers)}`;
  const shareText = `${shareLabel} ${result.score}/${result.total}\n${emojiRow}`;

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
                      className="inline-flex items-center gap-1 underline underline-offset-2"
                      href={`https://icon-sets.iconify.design/${item.meta.setId}/${icon.icon}/`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block size-5 shrink-0 [&>svg]:size-full"
                        dangerouslySetInnerHTML={{ __html: icon.svg }}
                      />
                      {icon.icon}
                    </a>
                  </span>
                ))}
              </span>
            </Card>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <ShareButton path={sharePath} text={shareText} />
        <TweetButton path={sharePath} text={shareText} />
      </div>
      <div className="flex gap-4">
        <Link className={linkClassName} to={replayTo}>
          もう一度遊ぶ
        </Link>
      </div>
      <Link className="text-muted text-center text-sm underline underline-offset-2" to="/">
        ← トップに戻る
      </Link>
    </main>
  );
};
