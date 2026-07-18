import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequestUrl, setResponseHeader } from "@tanstack/react-start/server";

import { quizConfig, shareLabelFor, type QuizGame, type QuizMode } from "#/lib/quiz";

import { getRunResult } from "./run-result";

import type { ShareLoaderData } from "#/features/result/types";

type LoadShareResultInput = {
  answers: string;
  game: QuizGame;
  mode: QuizMode;
  seed: string;
};

export const loadShareResult = createServerOnlyFn(
  async ({ answers, game, mode, seed }: LoadShareResultInput): Promise<ShareLoaderData> => {
    const result = await getRunResult({ data: { answers, game, mode, seed } });
    // 呼び出し先の getRunResult が private, no-store を設定するため、共有ページ用に上書きする
    setResponseHeader("cache-control", "public, max-age=31536000, immutable");
    const { href, origin } = getRequestUrl();
    const label = shareLabelFor(game, mode, seed);
    const imageUrl = `${origin}${quizConfig[mode].games[game].basePath}/${encodeURIComponent(seed)}/share/og?a=${encodeURIComponent(answers)}`;
    return { game, imageUrl, label, mode, pageUrl: href, result, seed };
  },
);

type CreateShareOgImageResponseInput = {
  answers: string;
  game: QuizGame;
  mode: QuizMode;
  seed: string;
};

export const createShareOgImageResponse = createServerOnlyFn(
  async ({ answers, game, mode, seed }: CreateShareOgImageResponseInput): Promise<Response> => {
    const result = await getRunResult({ data: { answers, game, mode, seed } });
    if (!result.success) {
      return new Response("Not Found", { status: 404 });
    }
    const { renderShareOgImage } = await import("#/lib/og.server");
    const png = await renderShareOgImage({
      correctFlags: result.items.map((item) => item.correct),
      modeLabel: quizConfig[mode].games[game].label,
      score: result.score,
      seedLabel: seed,
    });
    // 呼び出し先の getRunResult が private, no-store を設定するため、画像レスポンス用に上書きする
    setResponseHeader("cache-control", "public, max-age=31536000, immutable");
    return new Response(png, { headers: { "content-type": "image/png" } });
  },
);

export const createShareHead = ({ loaderData }: { loaderData?: ShareLoaderData }) => {
  if (!loaderData || !loaderData.result.success) {
    return { meta: [{ title: "結果が見つかりません - Icondle" }] };
  }
  const { imageUrl, label, pageUrl, result } = loaderData;
  const title = `${label} ${result.score}/${result.total}`;
  const description = `Icondleでのプレイ結果: ${result.score}/${result.total}問正解`;
  return {
    links: [{ href: pageUrl, rel: "canonical" }],
    meta: [
      { title },
      { content: description, name: "description" },
      { content: title, property: "og:title" },
      { content: description, property: "og:description" },
      { content: imageUrl, property: "og:image" },
      { content: "1200", property: "og:image:width" },
      { content: "630", property: "og:image:height" },
      { content: pageUrl, property: "og:url" },
      { content: "summary_large_image", name: "twitter:card" },
      { content: title, name: "twitter:title" },
      { content: description, name: "twitter:description" },
      { content: imageUrl, name: "twitter:image" },
    ],
  };
};
