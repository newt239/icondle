import type { RefObject } from "react";

import { Card } from "@heroui/react";

import type { AnswerMeta } from "#/lib/quiz-types";

type PickExplanationPanelProps = {
  correct: boolean;
  answerIndex: number;
  meta: AnswerMeta;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

export const PickExplanationPanel = ({
  correct,
  answerIndex,
  meta,
  headingRef,
}: PickExplanationPanelProps) => (
  <Card className="gap-3 p-6" role="status">
    <h2 className="text-lg font-bold" ref={headingRef} tabIndex={-1}>
      {correct ? "⭕ 正解！" : "❌ 不正解…"}
    </h2>
    <p>
      正解は選択肢 {answerIndex + 1}。これは <strong>{meta.set}</strong> の{" "}
      <strong>{meta.icon}</strong> アイコンです。
    </p>
  </Card>
);
