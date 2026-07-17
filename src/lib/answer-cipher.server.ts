import "@tanstack/react-start/server-only";
import { hash } from "./prng";

import type { QuizGame, QuizMode } from "./quiz-config";

const CHOICE_COUNT = 4;

export type AnswerCipherContext = {
  game: QuizGame;
  mode: QuizMode;
  seed: string;
  n: number;
};

const shiftFor = (secretKey: string, ctx: AnswerCipherContext): number =>
  hash(`${secretKey}:${ctx.game}:${ctx.mode}:${ctx.seed}:${ctx.n}`) % CHOICE_COUNT;

export const encodeAnswer = (secretKey: string, ctx: AnswerCipherContext, picked: number): number =>
  (picked + shiftFor(secretKey, ctx)) % CHOICE_COUNT;

export const decodeAnswer = (
  secretKey: string,
  ctx: AnswerCipherContext,
  encoded: number,
): number => (encoded - shiftFor(secretKey, ctx) + CHOICE_COUNT) % CHOICE_COUNT;
