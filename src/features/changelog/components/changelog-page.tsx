import { Link } from "@tanstack/react-router";

import { BackToTopLink } from "#/components/back-to-top-link";
import { changelog } from "#/data/changelog";

export const ChangelogPage = () => (
  <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
    <header className="flex items-center justify-between gap-4">
      <Link className="text-xl font-bold" to="/">
        Icondle
      </Link>
    </header>
    <h1 className="text-2xl font-bold">更新履歴</h1>
    <div className="flex flex-col gap-6">
      {changelog.map((entry) => (
        <section className="flex flex-col gap-2" key={entry.version}>
          <div className="flex items-baseline gap-2">
            <h2 className="font-bold">v{entry.version}</h2>
            <p className="text-muted text-xs">{entry.date}</p>
          </div>
          <ul className="text-muted flex list-disc flex-col gap-1 pl-5 text-sm">
            {entry.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
    <BackToTopLink />
  </main>
);
