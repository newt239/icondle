import { Disclosure } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import { BackToTopLink } from "#/components/back-to-top-link";

import { SetCard } from "./set-card";

import type { SetOverview } from "#/lib/quiz-types";

type SetsPageProps = {
  sets: SetOverview[];
};

export const SetsPage = ({ sets }: SetsPageProps) => {
  const easySets = sets.filter((set) => set.difficulty === "easy");
  const hardOnlySets = sets.filter((set) => set.difficulty === "hard");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <Link className="text-xl font-bold" to="/">
          Icondle
        </Link>
      </header>
      <h1 className="text-2xl font-bold">収録アイコンセット</h1>
      <ul className="flex flex-col gap-4">
        {easySets.map((set) => (
          <li key={set.id}>
            <SetCard set={set} />
          </li>
        ))}
      </ul>
      <Disclosure>
        <Disclosure.Heading className="flex justify-center">
          <Disclosure.Trigger className="bg-surface-secondary text-surface-secondary-foreground flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium">
            Hardモード
            <Disclosure.Indicator />
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content className="pt-6">
          <ul className="flex flex-col gap-4">
            {hardOnlySets.map((set) => (
              <li key={set.id}>
                <SetCard set={set} />
              </li>
            ))}
          </ul>
        </Disclosure.Content>
      </Disclosure>
      <BackToTopLink className="mt-4" />
    </main>
  );
};
