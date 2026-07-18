import { buttonVariants, EmptyState } from "@heroui/react";
import { Link, Navigate } from "@tanstack/react-router";

import type { QuizGame, QuizMode } from "#/lib/quiz";
import type { RunResult } from "#/types";

type ShareRedirectPageProps = {
  game: QuizGame;
  mode: QuizMode;
  result: RunResult;
  seed: string;
};

export const ShareRedirectPage = ({ game, mode, result, seed }: ShareRedirectPageProps) => {
  const targetTo =
    game === "play"
      ? mode === "hard"
        ? "/play/hard/$seed/$n"
        : "/play/$seed/$n"
      : mode === "hard"
        ? "/pick/hard/$seed/$n"
        : "/pick/$seed/$n";

  if (!result.success) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
        <EmptyState className="gap-4">
          <h1 className="text-xl font-bold">結果を表示できません</h1>
          <p className="text-muted">{result.error}</p>
          <Link className={buttonVariants({ variant: "primary" })} to="/">
            トップに戻る
          </Link>
        </EmptyState>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-8">
      <Navigate params={{ n: "1", seed }} replace to={targetTo} />
      <p className="text-muted">問題にリダイレクトしています…</p>
      <Link
        className={buttonVariants({ variant: "primary" })}
        params={{ n: "1", seed }}
        to={targetTo}
      >
        手動で移動する
      </Link>
    </main>
  );
};
