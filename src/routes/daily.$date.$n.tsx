import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { QuestionPage } from "#/features/question/components/question-page";
import { getQuestion } from "#/lib/question";
import { DAILY_QUESTION_COUNT } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const nSchema = z.coerce.number().int().min(1).max(DAILY_QUESTION_COUNT);

const DailyQuestion = () => {
  const { date, n } = Route.useParams();
  const { a } = Route.useSearch();
  const question = Route.useLoaderData();
  return (
    <QuestionPage
      answers={a ?? ""}
      gradeSeed={`daily:${date}`}
      key={`${date}:${n}`}
      mode="daily"
      n={Number(n)}
      question={question}
      slug={date}
      total={DAILY_QUESTION_COUNT}
    />
  );
};

export const Route = createFileRoute("/daily/$date/$n")({
  component: DailyQuestion,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: ({ params }) =>
    getQuestion({
      data: { n: nSchema.parse(params.n), seed: `daily:${dateSchema.parse(params.date)}` },
    }),
  validateSearch: quizSearchSchema,
});
