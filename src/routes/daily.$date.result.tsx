import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ResultPage } from "#/features/result/components/result-page";
import { getRunResult } from "#/lib/grade";
import { DAILY_QUESTION_COUNT } from "#/lib/quiz-config";
import { quizSearchSchema } from "#/lib/search-schemas";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const DailyResult = () => {
  const { date } = Route.useParams();
  const result = Route.useLoaderData();
  return (
    <ResultPage
      result={result}
      shareLabel={`Guess Icon Daily ${date}`}
      sharePath={`/daily/${date}/1`}
    />
  );
};

const loaderDeps = ({ search }: { search: { a?: string } }) => ({ a: search.a ?? "" });

export const Route = createFileRoute("/daily/$date/result")({
  component: DailyResult,
  headers: () => ({ "cache-control": "private, no-store" }),
  loader: ({ deps, params }) =>
    getRunResult({
      data: {
        answers: deps.a,
        seed: `daily:${dateSchema.parse(params.date)}`,
        total: DAILY_QUESTION_COUNT,
      },
    }),
  loaderDeps,
  validateSearch: quizSearchSchema,
});
