import { Card } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import type { SetOverview } from "#/lib/quiz-types";

type SetsPageProps = {
  sets: SetOverview[];
};

export const SetsPage = ({ sets }: SetsPageProps) => (
  <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-4 py-8">
    <header className="flex items-center justify-between gap-4">
      <Link className="text-xl font-bold" to="/">
        Guess Icon
      </Link>
    </header>
    <h1 className="text-2xl font-bold">収録アイコンセット</h1>
    <p className="text-neutral-500">
      出題に使用している 12 セットの一覧です。セット名を選ぶと Iconify
      のセットページが開きます。サンプルのアイコンは表示のたびにランダムに変わります。
    </p>
    <ul className="flex flex-col gap-4">
      {sets.map((set) => (
        <li key={set.id}>
          <Card className="gap-3 p-6">
            <h2 className="text-lg font-bold">
              <a
                className="underline underline-offset-2"
                href={`https://icon-sets.iconify.design/${set.id}/`}
                rel="noreferrer"
                target="_blank"
              >
                {set.label}
              </a>
            </h2>
            <p className="text-sm">{set.origin}</p>
            <p className="text-sm text-neutral-500">
              {set.grid}px グリッド・{set.style === "stroke" ? "線画" : "塗り"}・
              {set.iconCount.toLocaleString("ja-JP")} アイコン・
              {set.license.url === "" ? (
                set.license.title
              ) : (
                <a
                  className="underline underline-offset-2"
                  href={set.license.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {set.license.title}
                </a>
              )}
            </p>
            <ul className="flex flex-wrap gap-3 text-neutral-900 dark:text-neutral-100">
              {set.samples.map((sample) => (
                <li
                  className="size-8 [&>svg]:size-full"
                  dangerouslySetInnerHTML={{ __html: sample.svg }}
                  key={sample.name}
                  title={sample.name}
                />
              ))}
            </ul>
          </Card>
        </li>
      ))}
    </ul>
  </main>
);
