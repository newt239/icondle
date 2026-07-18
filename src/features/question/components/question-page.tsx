import { useRef, useState, useTransition } from "react";

import { buttonVariants } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import { QuestionProgress } from "#/components/question-progress";
import { gradeAnswer } from "#/features/question/lib/grade";
import { useChoiceShortcuts } from "#/hooks/use-choice-shortcuts";
import { quizConfig, type QuizMode } from "#/lib/quiz";

import { ExplanationPanel } from "./explanation-panel";
import { PickChoiceList } from "./pick-choice-list";
import { PlayChoiceList } from "./play-choice-list";
import { PlayQuestionCard } from "./play-question-card";

import type { GradeResult, QuizQuestion } from "#/types";

type QuestionPageProps = {
  answers: string;
  mode: QuizMode;
  n: number;
  question: QuizQuestion;
  seed: string;
  total: number;
};

export const QuestionPage = ({ answers, mode, n, question, seed, total }: QuestionPageProps) => {
  const { game } = question;
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
      const graded = await gradeAnswer({ data: { answer: index, game, mode, n, seed } });
      setResult(graded);
      requestAnimationFrame(() => headingRef.current?.focus());
    });
  };

  useChoiceShortcuts(choose);

  const answered = result?.success === true ? result : null;
  const isLast = n >= total;
  const nextAnswers = answered === null ? answers : `${answers}${answered.encodedAnswer}`;
  const { basePath } = quizConfig[mode].games[game];
  const nextFormAction = isLast ? `${basePath}/${seed}/result` : `${basePath}/${seed}/${n + 1}`;
  const nextTo =
    game === "play"
      ? mode === "hard"
        ? "/play/hard/$seed/$n"
        : "/play/$seed/$n"
      : mode === "hard"
        ? "/pick/hard/$seed/$n"
        : "/pick/$seed/$n";
  const resultTo =
    game === "play"
      ? mode === "hard"
        ? "/play/hard/$seed/result"
        : "/play/$seed/result"
      : mode === "hard"
        ? "/pick/hard/$seed/result"
        : "/pick/$seed/result";
  const answeredLabels: [string, string, string, string] | null =
    answered === null
      ? null
      : [
          `${answered.meta.set} の ${answered.meta.icons[0].icon} アイコン`,
          `${answered.meta.set} の ${answered.meta.icons[1].icon} アイコン`,
          `${answered.meta.set} の ${answered.meta.icons[2].icon} アイコン`,
          `${answered.meta.set} の ${answered.meta.icons[3].icon} アイコン`,
        ];

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
      {question.game === "play" ? (
        <>
          <h1 className="text-muted text-center">このアイコンのセット名は？</h1>
          <PlayQuestionCard answeredLabels={answeredLabels} svgs={question.svgs} />
          <PlayChoiceList
            answerIndex={answered?.answerIndex ?? null}
            answers={answers}
            choices={question.choices}
            disabled={picked !== null || isPending}
            nextFormAction={nextFormAction}
            onChoose={choose}
            picked={picked}
          />
        </>
      ) : (
        <>
          <h1 className="text-muted text-center">
            <strong className="text-foreground">{question.setLabel}</strong> のアイコンは？
          </h1>
          <PickChoiceList
            answeredLabels={answeredLabels}
            answerIndex={answered?.answerIndex ?? null}
            answers={answers}
            choiceLabels={answered?.choiceLabels ?? null}
            choices={question.choices}
            disabled={picked !== null || isPending}
            nextFormAction={nextFormAction}
            onChoose={choose}
            picked={picked}
          />
        </>
      )}
      {result?.success === false && <p role="status">{result.error}</p>}
      {answered !== null && (
        <>
          <ExplanationPanel
            answerIndex={game === "pick" ? answered.answerIndex : null}
            correct={answered.correct}
            headingRef={headingRef}
            meta={answered.meta}
          />
          {isLast ? (
            <Link
              className={`${buttonVariants({ variant: "primary" })} self-end`}
              params={{ seed }}
              search={{ a: nextAnswers }}
              to={resultTo}
            >
              結果を見る
            </Link>
          ) : (
            <Link
              className={`${buttonVariants({ variant: "primary" })} self-end`}
              params={{ n: String(n + 1), seed }}
              search={{ a: nextAnswers }}
              to={nextTo}
            >
              次の問題へ
            </Link>
          )}
        </>
      )}
    </main>
  );
};
