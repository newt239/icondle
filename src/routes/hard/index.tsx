import { Card, IconChevronRight } from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Footer } from "#/components/footer";
import { createPageHeadObject } from "#/lib/meta";

const Hard = () => {
  const { heroIconPosition } = Route.useLoaderData();
  return (
    <>
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-1 flex-col items-center gap-6 px-4 pb-6">
        <div className="flex h-[40svh] w-full items-center justify-center">
          <div className="relative z-0 h-50 w-70">
            <div
              aria-hidden="true"
              className="bg-hero-icons absolute inset-0"
              style={{ maskPosition: `${heroIconPosition.x}px ${heroIconPosition.y}px` }}
            />
            <div className="bg-background absolute inset-10 flex items-center justify-center">
              <h1 className="text-4xl font-bold">Icondle</h1>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold">Hardモード</h2>
        <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <Card<"a">
            className="group focus-visible:outline-focus gap-3 p-6 transition-shadow outline-none hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2"
            render={(props) => <Link {...props} to="/hard/play" />}
          >
            <h3 className="font-bold">セット名を当てる</h3>
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
            render={(props) => <Link {...props} to="/hard/pick" />}
          >
            <h3 className="font-bold">アイコンを当てる</h3>
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
        <Link className="text-muted text-sm underline underline-offset-2" to="/">
          かんたんモードにする
        </Link>
      </main>
      <Footer />
    </>
  );
};

const GRID_CELLS = 12;
const CELL_SIZE = 40;

export const Route = createFileRoute("/hard/")({
  component: Hard,
  head: () =>
    createPageHeadObject({
      description:
        "マイナーなアイコンセットも含めて全 10 問出題されるHardモード。セット名当てとアイコン当ての 2 つの遊び方から選べます。",
      path: "/hard",
      title: "Hardモード",
    }),
  loader: () => ({
    heroIconPosition: {
      x: -(Math.floor(Math.random() * GRID_CELLS) * CELL_SIZE),
      y: -(Math.floor(Math.random() * GRID_CELLS) * CELL_SIZE),
    },
  }),
});
