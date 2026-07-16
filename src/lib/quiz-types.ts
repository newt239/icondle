export type ClientQuestion = {
  svg: string;
  choices: [string, string, string, string];
};

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
