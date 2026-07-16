import type { RefObject } from "react";

import { Card } from "@heroui/react";

import type { AnswerMeta } from "#/lib/quiz-types";

type ExplanationPanelProps = {
  correct: boolean;
  meta: AnswerMeta;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

export const ExplanationPanel = ({ correct, meta, headingRef }: ExplanationPanelProps) => (
  <Card className={`gap-3 p-6 ${correct ? "bg-success-soft" : "bg-danger-soft"}`} role="status">
    <h2 className="text-lg font-bold" ref={headingRef} tabIndex={-1}>
      {correct ? "⭕ 正解！" : "❌ 不正解…"}
    </h2>
    <p>
      これは <strong>{meta.set}</strong> の <strong>{meta.icon}</strong> アイコンです。
    </p>
  </Card>
);
