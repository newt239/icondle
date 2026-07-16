import { createFileRoute, Link } from "@tanstack/react-router";

import { jstToday } from "#/lib/quiz-config";

const Home = () => {
  const { today } = Route.useLoaderData();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Guess Icon</h1>
      <p className="text-neutral-500">このアイコン、どのセットのやつ？</p>
      <div className="flex gap-4">
        <Link
          className="rounded-full bg-neutral-900 px-8 py-3 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
          to="/play"
        >
          プレイする
        </Link>
        <Link
          className="rounded-full border border-neutral-300 px-8 py-3 font-medium dark:border-neutral-700"
          params={{ n: "1", seed: today }}
          to="/play/$seed/$n"
        >
          今日のデイリー
        </Link>
      </div>
      <div className="flex gap-4">
        <Link className="text-sm text-neutral-500 underline underline-offset-2" to="/play/hard">
          難しいモードでプレイ
        </Link>
        <Link className="text-sm text-neutral-500 underline underline-offset-2" to="/sets">
          収録アイコンセット
        </Link>
      </div>
    </main>
  );
};

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => ({ today: jstToday() }),
});
