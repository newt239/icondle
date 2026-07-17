import { Card } from "@heroui/react";

import type { SetOverview } from "#/lib/quiz-types";

type SetCardProps = {
  set: SetOverview;
};

export const SetCard = ({ set }: SetCardProps) => (
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
);
