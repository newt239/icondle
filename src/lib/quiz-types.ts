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
};

export type SetOverview = {
  id: string;
  label: string;
  origin: string;
  grid: number;
  style: "stroke" | "fill";
  iconCount: number;
  license: { spdx: string; title: string; url: string };
  samples: { name: string; svg: string }[];
};
