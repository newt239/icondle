import { useEffect, useState } from "react";

import { buttonVariants, Card, EmptyState } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import { BackToTopLink } from "#/components/back-to-top-link";
import { Footer } from "#/components/footer";
import { calculateDailyStreak } from "#/features/result/lib/daily-streak";
import { trackQuizComplete } from "#/lib/analytics";
import { jstToday } from "#/lib/date";
import { readPlayHistory, savePlayHistoryEntry } from "#/lib/history";
import { isDateSeed, quizConfig, type QuizGame, type QuizMode } from "#/lib/quiz";

import { DailyStreakDialog } from "./daily-streak-dialog";
import { TweetButton } from "./tweet-button";

import type { RunResult } from "#/types";

type ResultPageProps = {
  answers: string;
  game: QuizGame;
  mode: QuizMode;
  replayTo: "/hard/pick" | "/hard/play" | "/pick" | "/play";
  result: RunResult;
  seed: string;
};

export const ResultPage = ({ answers, game, mode, replayTo, result, seed }: ResultPageProps) => {
  const [streakDays, setStreakDays] = useState<number | null>(null);

  useEffect(() => {
    // 結果を localStorage のプレイ履歴に保存し、デイリー連続記録の判定と GA 計測イベントの送信を行うブラウザ API 副作用のため useEffect が必要
    if (!result.success) {
      return;
    }
    const isReplay = readPlayHistory().some(
      (entry) =>
        entry.game === game &&
        entry.mode === mode &&
        entry.seed === seed &&
        entry.answers === answers,
    );
    if (!isReplay) {
      trackQuizComplete({ game, mode, score: result.score, seed, total: result.total });
    }
    const history = savePlayHistoryEntry({
      answers,
      game,
      mode,
      playedAt: Date.now(),
      score: result.score,
      seed,
      total: result.total,
    });
    if (game === "pick" && mode === "easy" && seed === jstToday()) {
      const streak = calculateDailyStreak(history, seed);
      if (streak >= 2) {
        setStreakDays(streak);
      }
    }
  }, [answers, game, mode, seed, result]);

  if (!result.success) {
    return (
      <>
        <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 pt-8 pb-6">
          <EmptyState className="gap-4">
            <h1 className="text-xl font-bold">結果を表示できません</h1>
            <p className="text-muted">{result.error}</p>
            <Link className={`${buttonVariants({ variant: "primary" })} font-bold`} to={replayTo}>
              最初から遊ぶ
            </Link>
          </EmptyState>
          <BackToTopLink to={mode === "hard" ? "/hard" : "/"} />
        </main>
        <Footer />
      </>
    );
  }

  const emojiRow = result.items.map((item) => (item.correct ? "🟩" : "❌")).join("");
  const sharePath = `${quizConfig[mode].games[game].basePath}/${seed}/share?a=${encodeURIComponent(answers)}`;
  const modeLabel =
    game === "play" ? (mode === "hard" ? "Hard" : "") : mode === "hard" ? "Pick Hard" : "Pick";
  const seedLabel = isDateSeed(seed) ? seed.slice(5).replace("-", "/") : seed;
  const shareTitle = `#Icondle${modeLabel ? ` ${modeLabel}` : ""} [${seedLabel}]`;
  const shareText = `${shareTitle}\n\n${emojiRow}`;

  return (
    <>
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-1 flex-col gap-6 px-4 pt-8 pb-6">
        <header className="flex items-center justify-between gap-4">
          <Link className="text-xl font-bold" to="/">
            Icondle
          </Link>
        </header>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="flex items-baseline justify-center">
            <span className="text-5xl font-extrabold">
              {result.score}
              <span className="text-3xl">pt</span>
            </span>
          </h1>
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
          <BackToTopLink to={mode === "hard" ? "/hard" : "/"} />
          <Link className={`${buttonVariants({ variant: "primary" })} font-bold`} to={replayTo}>
            もっとプレイする
          </Link>
        </div>
        <Link className="text-muted text-center text-sm underline underline-offset-2" to="/sets">
          収録アイコンセットを確認する
        </Link>
        {streakDays !== null && (
          <DailyStreakDialog
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setStreakDays(null);
              }
            }}
            streakDays={streakDays}
          />
        )}
      </main>
      <Footer />
    </>
  );
};
