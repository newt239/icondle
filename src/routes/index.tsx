import { buttonVariants, Card } from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Footer } from "#/components/footer";
import { PlayHistorySummary } from "#/features/history/components/play-history-summary";
import { jstToday } from "#/lib/quiz-config";

const Home = () => {
  const { today } = Route.useLoaderData();
  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
        <h1 className="text-4xl font-bold">Icondle</h1>
        <Link
          className={buttonVariants({ size: "lg", variant: "primary" })}
          params={{ n: "1", seed: today }}
          to="/pick/$seed/$n"
        >
          今日の問題に挑戦
        </Link>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <Card<"a">
            className="group focus-visible:outline-focus gap-3 p-6 transition-shadow outline-none hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
            render={(props) => <Link {...props} to="/play" />}
          >
            <h2 className="font-bold">セット名を当てる</h2>
            <p className="text-muted text-sm">表示されたアイコンのセット名を 4 択から選ぶ</p>
            <span className="mt-auto self-end text-sm font-medium">
              プレイする{" "}
              <span
                aria-hidden="true"
                className="inline-block transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </span>
          </Card>
          <Card<"a">
            className="group focus-visible:outline-focus gap-3 p-6 transition-shadow outline-none hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
            render={(props) => <Link {...props} to="/pick" />}
          >
            <h2 className="font-bold">アイコンを当てる</h2>
            <p className="text-muted text-sm">セット名に合うアイコンを 4 つから選ぶ</p>
            <span className="mt-auto self-end text-sm font-medium">
              プレイする{" "}
              <span
                aria-hidden="true"
                className="inline-block transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </span>
          </Card>
        </div>
        <Link className="text-muted text-sm underline underline-offset-2" to="/sets">
          収録アイコンセット
        </Link>
        <PlayHistorySummary />
      </main>
      <Footer />
    </>
  );
};

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => ({ today: jstToday() }),
});
