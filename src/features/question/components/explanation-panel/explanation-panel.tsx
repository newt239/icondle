import type { RefObject } from "react";

import { Card, Chip } from "@heroui/react";

import type { AnswerMeta } from "#/lib/quiz-types";

type ExplanationPanelProps = {
  correct: boolean;
  meta: AnswerMeta;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

export const ExplanationPanel = ({ correct, meta, headingRef }: ExplanationPanelProps) => (
  <Card className="gap-3 p-6" role="status">
    <h2 className="text-lg font-bold" ref={headingRef} tabIndex={-1}>
      {correct ? "⭕ 正解！" : "❌ 不正解…"}
    </h2>
    <p>
      これは <strong>{meta.set}</strong> の <strong>{meta.icon}</strong> アイコンです。
    </p>
    <div className="flex flex-wrap gap-2">
      <Chip color="default" variant="soft">
        {meta.grid}px グリッド
      </Chip>
      <Chip color="default" variant="soft">
        {meta.style === "stroke" ? "線画" : "塗り"}
      </Chip>
      {meta.strokeWidth !== null && (
        <Chip color="default" variant="soft">
          stroke-width {meta.strokeWidth}
        </Chip>
      )}
      {meta.cap !== null && (
        <Chip color="default" variant="soft">
          cap {meta.cap}
        </Chip>
      )}
      <Chip color="accent" variant="soft">
        {meta.license.spdx === "" ? meta.license.title : meta.license.spdx}
      </Chip>
    </div>
    {meta.origin !== "" && <p className="text-sm text-neutral-500">{meta.origin}</p>}
  </Card>
);
