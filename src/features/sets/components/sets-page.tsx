import { Card } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import type { SetOverview } from "#/lib/quiz-types";

type SetsPageProps = {
  sets: SetOverview[];
};

export const SetsPage = ({ sets }: SetsPageProps) => (
  <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
    <header className="flex items-center justify-between gap-4">
      <Link className="text-xl font-bold" to="/">
        Icondle
      </Link>
    </header>
    <h1 className="text-2xl font-bold">収録アイコンセット</h1>
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
            <p className="text-muted text-sm">
              {set.grid}px グリッド・{set.iconCount.toLocaleString("ja-JP")} アイコン・
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
            <ul className="flex flex-wrap gap-3">
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
