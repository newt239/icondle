export type ClientQuestion = {
  svg: string;
  choices: [string, string, string, string];
};

export type GradeResult =
  | { success: true; correct: boolean; answerIndex: number; meta: AnswerMeta }
  | { success: false; error: string };

type RunResultItem = {
  n: number;
  picked: number;
  correct: boolean;
  answerIndex: number;
  meta: AnswerMeta;
};

export type RunResult =
  | { success: true; total: number; score: number; items: RunResultItem[] }
  | { success: false; error: string };

export type AnswerMeta = {
  set: string;
  setId: string;
  icon: string;
  concept: string;
  grid: number;
  style: "stroke" | "fill";
  strokeWidth: number | null;
  cap: string | null;
  license: { spdx: string; title: string; url: string };
  origin: string;
};
