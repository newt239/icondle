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
} from "@heroui/react";
import { Link } from "@tanstack/react-router";

import { BackToTopLink } from "#/components/back-to-top-link";
import { usePlayHistory } from "#/hooks/use-play-history";
import { clearPlayHistory } from "#/lib/quiz-history";

import { IconTrash } from "./icon-trash";
import { PlayHistoryList } from "./play-history-list";

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
      <PlayHistoryList />
      {history.length > 0 && <BackToTopLink />}
    </main>
  );
};
