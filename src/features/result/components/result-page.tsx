import { useEffect } from "react";

import { buttonVariants, Card, EmptyState } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import { isDateSeed, quizBasePath, type QuizGame, type QuizMode } from "#/lib/quiz-config";
import { savePlayHistoryEntry } from "#/lib/quiz-history";

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
  useEffect(() => {
    // 結果を localStorage のプレイ履歴に保存するブラウザ API 副作用のため useEffect が必要
    if (!result.success) {
      return;
    }
    savePlayHistoryEntry({
      answers,
      game,
      mode,
      playedAt: Date.now(),
      score: result.score,
      seed,
      total: result.total,
    });
  }, [answers, game, mode, seed, result]);

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
  const sharePath = `${quizBasePath(game, mode)}/${seed}/share?a=${encodeURIComponent(answers)}`;
  const modeLabel =
    game === "play" ? (mode === "hard" ? "Hard" : "") : mode === "hard" ? "Pick Hard" : "Pick";
  const seedLabel = isDateSeed(seed) ? seed.slice(5).replace("-", "/") : seed;
  const shareTitle = `#Icondle${modeLabel ? ` ${modeLabel}` : ""} [${seedLabel}]`;
  const shareText = `${shareTitle}\n\n${emojiRow}`;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <Link className="text-xl font-bold" to="/">
          Icondle
        </Link>
      </header>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="flex items-baseline justify-center">
          <span className="text-5xl font-extrabold">
            {result.score}
            <span className="text-3xl">pt</span>
          </span>
        </p>
        <p aria-hidden="true" className="text-2xl tracking-widest">
          {emojiRow}
        </p>
      </div>
      <div className="flex justify-center">
        <TweetButton path={sharePath} text={shareText} />
      </div>
      <ul className="flex flex-col gap-3">
        {result.items.map((item) => (
          <li key={item.n}>
            <Card
              className={`grid grid-cols-[1fr_auto] items-center gap-4 p-4 ${item.correct ? "bg-success-soft" : "bg-danger-soft"}`}
            >
              <div className="min-w-0">
                <span aria-hidden="true" className="text-3xl">
                  {item.correct ? "⭕" : "❌"}
                </span>
                <span className="sr-only">{item.correct ? "正解" : "不正解"}</span>
                <p className="text-lg font-semibold">第{item.n}問</p>
                <p className="text-muted text-sm">{item.meta.set}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {item.meta.icons.map((icon) => (
                  <a
                    className="flex w-12 flex-col items-center gap-1 sm:w-14"
                    href={`https://icon-sets.iconify.design/${item.meta.setId}/${icon.icon}/`}
                    key={icon.concept}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span
                      aria-hidden="true"
                      className="size-12 sm:size-14 [&>svg]:size-full"
                      dangerouslySetInnerHTML={{ __html: icon.svg }}
                    />
                    <span className="text-muted w-full truncate text-center text-xs underline underline-offset-2">
                      {icon.icon}
                    </span>
                  </a>
                ))}
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-4">
        <Link className="text-muted text-sm underline underline-offset-2" to="/">
          ← トップに戻る
        </Link>
        <Link className={linkClassName} to={replayTo}>
          もっとプレイする
        </Link>
      </div>
      <Link className="text-muted text-center text-sm underline underline-offset-2" to="/sets">
        収録アイコンセットを確認する
      </Link>
    </main>
  );
};
