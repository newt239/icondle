import { useRef, useState, useTransition } from "react";

import { buttonVariants } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import { QuestionProgress } from "#/components/question-progress";
import { gradeAnswer } from "#/features/question/lib/grade";
import { useChoiceShortcuts } from "#/hooks/use-choice-shortcuts";

import { ChoiceList } from "./choice-list";
import { ExplanationPanel } from "./explanation-panel";
import { QuestionCard } from "./question-card";

import type { QuizMode } from "#/lib/quiz";
import type { ClientQuestion, GradeResult } from "#/types";

type QuestionPageProps = {
  answers: string;
  mode: QuizMode;
  n: number;
  question: ClientQuestion;
  seed: string;
  total: number;
};

const nextLinkClassName = `${buttonVariants({ variant: "primary" })} self-end`;

export const QuestionPage = ({ answers, mode, n, question, seed, total }: QuestionPageProps) => {
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
      const graded = await gradeAnswer({ data: { answer: index, mode, n, seed } });
      setResult(graded);
      requestAnimationFrame(() => headingRef.current?.focus());
    });
  };

  useChoiceShortcuts(choose);

  const answered = result?.success === true ? result : null;
  const isLast = n >= total;
  const nextAnswers = answered === null ? answers : `${answers}${answered.encodedAnswer}`;
  const playBase = mode === "hard" ? `/play/hard/${seed}` : `/play/${seed}`;
  const nextFormAction = isLast ? `${playBase}/result` : `${playBase}/${n + 1}`;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <Link className="text-xl font-bold" to="/">
          Icondle
        </Link>
        <p className="text-muted text-sm">
          {n} / {total} 問
        </p>
      </header>
      <QuestionProgress n={n} total={total} />
      <h1 className="text-muted text-center">このアイコンのセット名は？</h1>
      <QuestionCard
        answeredLabels={
          answered === null
            ? null
            : [
                `${answered.meta.set} の ${answered.meta.icons[0].icon} アイコン`,
                `${answered.meta.set} の ${answered.meta.icons[1].icon} アイコン`,
                `${answered.meta.set} の ${answered.meta.icons[2].icon} アイコン`,
                `${answered.meta.set} の ${answered.meta.icons[3].icon} アイコン`,
              ]
        }
        svgs={question.svgs}
      />
      <ChoiceList
        answerIndex={answered?.answerIndex ?? null}
        answers={answers}
        choices={question.choices}
        disabled={picked !== null || isPending}
        nextFormAction={nextFormAction}
        onChoose={choose}
        picked={picked}
      />
      {result?.success === false && <p role="status">{result.error}</p>}
      {answered !== null && (
        <>
          <ExplanationPanel
            correct={answered.correct}
            headingRef={headingRef}
            meta={answered.meta}
          />
          {isLast ? (
            <Link
              className={nextLinkClassName}
              params={{ seed }}
              search={{ a: nextAnswers }}
              to={mode === "hard" ? "/play/hard/$seed/result" : "/play/$seed/result"}
            >
              結果を見る
            </Link>
          ) : (
            <Link
              className={nextLinkClassName}
              params={{ n: String(n + 1), seed }}
              search={{ a: nextAnswers }}
              to={mode === "hard" ? "/play/hard/$seed/$n" : "/play/$seed/$n"}
            >
              次の問題へ
            </Link>
          )}
        </>
      )}
    </main>
  );
};
