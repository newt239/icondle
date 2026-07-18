import {
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContainer,
  AlertDialogDialog,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogHeading,
  AlertDialogIcon,
  AlertDialogRoot,
  AlertDialogTrigger,
  Button,
  Card,
  EmptyState,
} from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { BackToTopLink } from "#/components/back-to-top-link";
import { IconTrash } from "#/components/icon-trash";
import { usePlayHistory } from "#/hooks/use-play-history";
import { formatPlayedAt } from "#/lib/date";
import { clearPlayHistory } from "#/lib/history";
import { createPageHeadObject } from "#/lib/meta";
import { quizConfig } from "#/lib/quiz";

const History = () => {
  const history = usePlayHistory();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pt-8 pb-[10lvh]">
      <header className="flex items-center justify-between gap-4">
        <Link className="text-xl font-bold" to="/">
          Icondle
        </Link>
      </header>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">プレイ履歴</h1>
        <AlertDialogRoot>
          <AlertDialogTrigger>
            <Button variant="danger-soft">
              <IconTrash aria-hidden="true" />
              履歴を削除する
            </Button>
          </AlertDialogTrigger>
          <AlertDialogBackdrop>
            <AlertDialogContainer>
              <AlertDialogDialog>
                <AlertDialogHeader>
                  <AlertDialogIcon />
                  <AlertDialogHeading>プレイ履歴をすべて削除しますか?</AlertDialogHeading>
                </AlertDialogHeader>
                <AlertDialogBody>
                  この操作は取り消せません。プレイ履歴がすべて削除されます。
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button slot="close" variant="secondary">
                    キャンセルする
                  </Button>
                  <Button onPress={clearPlayHistory} slot="close" variant="danger">
                    削除する
                  </Button>
                </AlertDialogFooter>
              </AlertDialogDialog>
            </AlertDialogContainer>
          </AlertDialogBackdrop>
        </AlertDialogRoot>
      </div>
      {history.length === 0 ? (
        <EmptyState className="gap-2">
          <p className="text-muted">まだプレイ履歴がありません</p>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {history.map((entry) => (
            <li key={`${entry.game}:${entry.mode}:${entry.seed}`}>
              <Card<"a">
                className="group focus-visible:outline-focus flex-row items-center gap-3 p-4 transition-shadow outline-none hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                render={(props) => (
                  <Link
                    {...props}
                    params={{ seed: entry.seed }}
                    search={{ a: entry.answers }}
                    to={`${quizConfig[entry.mode].games[entry.game].basePath}/$seed/result`}
                  />
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-medium">{entry.seed}</span>
                  <span className="text-muted text-xs">{formatPlayedAt(entry.playedAt)}</span>
                </div>
                <span className="font-bold">
                  {entry.score} / {entry.total}
                </span>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {history.length > 0 && <BackToTopLink />}
    </main>
  );
};

export const Route = createFileRoute("/history")({
  component: History,
  head: () =>
    createPageHeadObject({
      description: "自分のIcondleプレイ履歴と正答率を確認できます。",
      path: "/history",
      title: "プレイ履歴",
    }),
});
