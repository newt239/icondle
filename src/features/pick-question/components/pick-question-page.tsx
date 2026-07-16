import { useRef, useState, useTransition } from "react";

import { Link } from "@tanstack/react-router";

import { QuestionProgress } from "#/components/question-progress";
import { gradePickAnswer } from "#/features/pick-question/lib/pick-grade";
import { useChoiceShortcuts } from "#/hooks/use-choice-shortcuts";

import { PickChoiceList } from "./pick-choice-list";
import { PickExplanationPanel } from "./pick-explanation-panel";

import type { QuizMode } from "#/lib/quiz-config";
import type { GradeResult, PickClientQuestion } from "#/lib/quiz-types";

type PickQuestionPageProps = {
  answers: string;
  mode: QuizMode;
  n: number;
  question: PickClientQuestion;
  seed: string;
  total: number;
};

const nextLinkClassName =
  "self-end rounded-full bg-neutral-900 px-6 py-2 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900";

export const PickQuestionPage = ({
  answers,
  mode,
  n,
  question,
  seed,
  total,
}: PickQuestionPageProps) => {
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const choose = (index: number) => {
    if (picked !== null || isPending) {
      return;
    }
    setPicked(index);
    startTransition(async () => {
      const graded = await gradePickAnswer({ data: { answer: index, mode, n, seed } });
      setResult(graded);
      requestAnimationFrame(() => headingRef.current?.focus());
    });
  };

  useChoiceShortcuts(choose);

  const answered = result?.success === true ? result : null;
  const isLast = n >= total;
  const nextAnswers = picked === null ? answers : `${answers}${picked}`;
  const pickBase = mode === "hard" ? `/pick/hard/${seed}` : `/pick/${seed}`;
  const nextFormAction = isLast ? `${pickBase}/result` : `${pickBase}/${n + 1}`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <Link className="text-xl font-bold" to="/">
          Guess Icon
        </Link>
        <p className="text-sm text-neutral-500">
          {n} / {total} 問
        </p>
      </header>
      <QuestionProgress n={n} total={total} />
      <p className="text-center text-neutral-500">
        この中で{" "}
        <strong className="text-neutral-900 dark:text-neutral-100">{question.setLabel}</strong>{" "}
        のアイコンはどれ？
      </p>
      <PickChoiceList
        answeredLabel={
          answered === null ? null : `${answered.meta.set} の ${answered.meta.icon} アイコン`
        }
        answerIndex={answered?.answerIndex ?? null}
        answers={answers}
        disabled={picked !== null || isPending}
        nextFormAction={nextFormAction}
        onChoose={choose}
        picked={picked}
        svgs={question.svgs}
      />
      {result?.success === false && <p role="status">{result.error}</p>}
      {answered !== null && (
        <>
          <PickExplanationPanel
            answerIndex={answered.answerIndex}
            correct={answered.correct}
            headingRef={headingRef}
            meta={answered.meta}
          />
          {isLast ? (
            <Link
              className={nextLinkClassName}
              params={{ seed }}
              search={{ a: nextAnswers }}
              to={mode === "hard" ? "/pick/hard/$seed/result" : "/pick/$seed/result"}
            >
              結果を見る
            </Link>
          ) : (
            <Link
              className={nextLinkClassName}
              params={{ n: String(n + 1), seed }}
              search={{ a: nextAnswers }}
              to={mode === "hard" ? "/pick/hard/$seed/$n" : "/pick/$seed/$n"}
            >
              次の問題へ
            </Link>
          )}
        </>
      )}
    </main>
  );
};
