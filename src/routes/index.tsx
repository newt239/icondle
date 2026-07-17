import { buttonVariants, Card, IconChevronRight } from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Footer } from "#/components/footer";
import { jstToday } from "#/lib/quiz-config";
import { SITE_URL } from "#/lib/site-config";

const Home = () => {
  const { today } = Route.useLoaderData();
  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-6 px-4 pb-8">
        <div className="flex h-[40svh] w-full items-center justify-center">
          <h1 className="text-4xl font-bold">Icondle</h1>
        </div>
        <Link
          className={buttonVariants({ size: "lg", variant: "primary" })}
          params={{ n: "1", seed: today }}
          to="/pick/$seed/$n"
        >
          <span className="font-bold">今日の問題に挑戦する</span>
          <IconChevronRight aria-hidden="true" stroke="currentColor" strokeWidth={1} />
        </Link>
        <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <Card<"a">
            className="group focus-visible:outline-focus gap-3 p-6 transition-shadow outline-none hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
            render={(props) => <Link {...props} to="/play" />}
          >
            <h2 className="font-bold">セット名を当てる</h2>
            <p className="text-muted text-sm">表示されたアイコンのセット名を 4 択から選ぶ</p>
            <span className="mt-auto inline-flex items-center gap-0.5 self-end text-sm font-medium">
              プレイする
              <IconChevronRight
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </span>
          </Card>
          <Card<"a">
            className="group focus-visible:outline-focus gap-3 p-6 transition-shadow outline-none hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
            render={(props) => <Link {...props} to="/pick" />}
          >
            <h2 className="font-bold">アイコンを当てる</h2>
            <p className="text-muted text-sm">セット名に合うアイコンを 4 つから選ぶ</p>
            <span className="mt-auto inline-flex items-center gap-0.5 self-end text-sm font-medium">
              プレイする
              <IconChevronRight
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </span>
          </Card>
        </div>
        <Link className="text-muted text-sm underline underline-offset-2" to="/sets">
          収録アイコンセット
        </Link>
      </main>
      <Footer />
    </>
  );
};

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({ links: [{ href: SITE_URL, rel: "canonical" }] }),
  loader: () => ({ today: jstToday() }),
});
