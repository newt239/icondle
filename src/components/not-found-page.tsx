import { buttonVariants } from "@heroui/react";
import { Link } from "@tanstack/react-router";

export const NotFoundPage = () => (
  <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
    <h1 className="text-2xl font-bold">ページが見つかりません</h1>
    <p className="text-muted text-center">
      URL が誤っているか、まだ公開されていない日付の可能性があります。
    </p>
    <Link className={buttonVariants({ variant: "primary" })} to="/">
      トップへ戻る
    </Link>
  </main>
);
