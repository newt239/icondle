import { buttonVariants } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import { Footer } from "#/components/footer";

export const NotFoundPage = () => (
  <>
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 px-4 pb-6">
      <h1 className="text-2xl font-bold">ページが見つかりません</h1>
      <p className="text-muted text-center">
        URLが誤っているか、まだ公開されていない日付の可能性があります。
      </p>
      <Link className={`${buttonVariants({ variant: "primary" })} font-bold`} to="/">
        トップへ戻る
      </Link>
    </main>
    <Footer />
  </>
);
