import { buttonVariants, EmptyState } from "@heroui/react";
import { Link, Navigate } from "@tanstack/react-router";

import { Footer } from "#/components/footer";

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
        ? "/hard/play/$seed/$n"
        : "/play/$seed/$n"
      : mode === "hard"
        ? "/hard/pick/$seed/$n"
        : "/pick/$seed/$n";

  if (!result.success) {
    return (
      <>
        <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 pt-8 pb-6">
          <EmptyState className="gap-4">
            <h1 className="text-xl font-bold">結果を表示できません</h1>
            <p className="text-muted">{result.error}</p>
            <Link className={`${buttonVariants({ variant: "primary" })} font-bold`} to="/">
              トップに戻る
            </Link>
          </EmptyState>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 pt-8 pb-6">
        <Navigate params={{ n: "1", seed }} replace to={targetTo} />
        <p className="text-muted">問題にリダイレクトしています…</p>
        <Link
          className={`${buttonVariants({ variant: "primary" })} font-bold`}
          params={{ n: "1", seed }}
          to={targetTo}
        >
          手動で移動する
        </Link>
      </main>
      <Footer />
    </>
  );
};
