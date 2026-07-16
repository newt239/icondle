import { buttonVariants, Card } from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { jstToday } from "#/lib/quiz-config";

const Home = () => {
  const { today } = Route.useLoaderData();
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold">Guess Icon</h1>
        <p className="text-muted">このアイコン、どのセットのやつ？</p>
      </div>
      <Link
        className={buttonVariants({ size: "lg", variant: "primary" })}
        params={{ n: "1", seed: today }}
        to="/pick/$seed/$n"
      >
        今日のデイリーに挑戦
      </Link>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="items-start gap-3 p-6">
          <h2 className="font-bold">セット名を当てる</h2>
          <p className="text-muted text-sm">表示されたアイコンのセット名を 4 択から選ぶ</p>
          <div className="flex flex-wrap gap-2">
            <Link className={buttonVariants({ size: "sm", variant: "secondary" })} to="/play">
              あそぶ
            </Link>
            <Link className={buttonVariants({ size: "sm", variant: "ghost" })} to="/play/hard">
              むずかしい
            </Link>
          </div>
        </Card>
        <Card className="items-start gap-3 p-6">
          <h2 className="font-bold">アイコンを当てる</h2>
          <p className="text-muted text-sm">セット名に合うアイコンを 4 つから選ぶ</p>
          <div className="flex flex-wrap gap-2">
            <Link className={buttonVariants({ size: "sm", variant: "secondary" })} to="/pick">
              あそぶ
            </Link>
            <Link className={buttonVariants({ size: "sm", variant: "ghost" })} to="/pick/hard">
              むずかしい
            </Link>
          </div>
        </Card>
      </div>
      <Link className="text-muted text-sm underline underline-offset-2" to="/sets">
        収録アイコンセット
      </Link>
    </main>
  );
};

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => ({ today: jstToday() }),
});
