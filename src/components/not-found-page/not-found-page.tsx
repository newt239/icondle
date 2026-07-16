import { Link } from "@tanstack/react-router";

export const NotFoundPage = () => (
  <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
    <h1 className="text-2xl font-bold">ページが見つかりません</h1>
    <p className="text-center text-neutral-500">
      URL が誤っているか、まだ公開されていない日付の可能性があります。
    </p>
    <Link
      className="rounded-full bg-neutral-900 px-6 py-2 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
      to="/"
    >
      トップへ戻る
    </Link>
  </main>
);
