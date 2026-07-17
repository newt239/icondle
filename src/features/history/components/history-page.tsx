import { Button } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import { BackToTopLink } from "#/components/back-to-top-link";
import { usePlayHistory } from "#/hooks/use-play-history";
import { clearPlayHistory } from "#/lib/quiz-history";

import { PlayHistoryList } from "./play-history-list";

const handleClear = () => {
  if (confirm("プレイ履歴をすべて削除します。よろしいですか?")) {
    clearPlayHistory();
  }
};

export const HistoryPage = () => {
  const history = usePlayHistory();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <Link className="text-xl font-bold" to="/">
          Icondle
        </Link>
      </header>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">プレイ履歴</h1>
        <Button onPress={handleClear} variant="danger-soft">
          履歴を削除
        </Button>
      </div>
      <PlayHistoryList />
      {history.length > 0 && <BackToTopLink />}
    </main>
  );
};
