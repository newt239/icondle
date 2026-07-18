import type { RefObject } from "react";

import { Card } from "@heroui/react";

import type { AnswerMeta } from "#/types";

type ExplanationPanelProps = {
  correct: boolean;
  answerIndex: number | null;
  meta: AnswerMeta;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

export const ExplanationPanel = ({
  correct,
  answerIndex,
  meta,
  headingRef,
}: ExplanationPanelProps) => (
  <Card className={`gap-3 p-6 ${correct ? "bg-success-soft" : "bg-danger-soft"}`} role="status">
    <h2 className="text-lg font-bold" ref={headingRef} tabIndex={-1}>
      {correct ? "⭕ 正解！" : "❌ 不正解…"}
    </h2>
    <p>
      {answerIndex !== null && <>正解は選択肢 {answerIndex + 1}。</>}これらは{" "}
      <strong>{meta.set}</strong> の{" "}
      {meta.icons.map((icon, index) => (
        <span key={icon.concept}>
          {index > 0 && "・"}
          <strong>{icon.icon}</strong>
        </span>
      ))}{" "}
      アイコンです。
    </p>
  </Card>
);
