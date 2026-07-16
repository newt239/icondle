export type ClientQuestion = {
  svgs: [string, string, string, string];
  choices: [string, string, string, string];
};

export type PickChoiceSvgs = [string, string, string, string];

export type PickClientQuestion = {
  setLabel: string;
  choices: [PickChoiceSvgs, PickChoiceSvgs, PickChoiceSvgs, PickChoiceSvgs];
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

export type AnswerIcon = {
  concept: string;
  icon: string;
  svg: string;
};

export type AnswerMeta = {
  set: string;
  setId: string;
  icons: [AnswerIcon, AnswerIcon, AnswerIcon, AnswerIcon];
};

export type SetOverview = {
  id: string;
  label: string;
  grid: number;
  iconCount: number;
  license: { spdx: string; title: string; url: string };
  samples: { name: string; svg: string }[];
};
