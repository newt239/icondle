import "@tanstack/react-start/server-only";
import type { ReactNode } from "react";

import { initWasm, Resvg } from "@resvg/resvg-wasm";
import wasmModule from "@resvg/resvg-wasm/index_bg.wasm";
import satori, { init as initSatoriYoga } from "satori/standalone";
import satoriYogaWasm from "satori/yoga.wasm";

import ogFontDataUri from "#/assets/fonts/inter-bold.ttf?inline";
import { SITE_URL } from "#/lib/site-config";

// トップページ背景と同じ public/bg-icons.svg を OGP 画像でも再利用するための例外的な相対 import
// oxlint-disable-next-line import/no-relative-parent-imports
import bgIconsSvgRaw from "../../public/bg-icons.svg?raw";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const CARD_WIDTH = 900;
const CARD_HEIGHT = 360;
const FONT_FAMILY = "Inter";
const FONT_WEIGHT = 700;
const ICON_GRID_COLOR = "#334155";
const BACKGROUND_COLOR = "#0b1220";
const CARD_BACKGROUND_COLOR = "#131f35";
const CARD_BORDER_COLOR = "rgba(248, 250, 252, 0.08)";
const TEXT_COLOR = "#f8fafc";
const CORRECT_COLOR = "#34d399";
const INCORRECT_COLOR = "#475569";
const SITE_URL_DISPLAY = SITE_URL.replace(/^https?:\/\//, "");

const buildIconGridDataUri = (): string => {
  const withoutComment = bgIconsSvgRaw.replace(/<!--[\s\S]*?-->/, "");
  const colored = withoutComment.replaceAll("currentColor", ICON_GRID_COLOR);
  return `data:image/svg+xml;base64,${btoa(colored)}`;
};

const ICON_GRID_DATA_URI = buildIconGridDataUri();

const decodeBase64FontDataUri = (dataUri: string): ArrayBuffer => {
  const base64 = dataUri.slice(dataUri.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.codePointAt(index) ?? 0;
  }
  return bytes.buffer;
};

const FONT_DATA = decodeBase64FontDataUri(ogFontDataUri);

let resvgWasmReady: Promise<void> | null = null;
let satoriYogaReady: Promise<void> | null = null;

const ensureResvgReady = async (): Promise<void> => {
  // Cloudflare Workers はランタイムでの動的な wasm コンパイルを許可しないため、静的 import した Module を渡して初期化する
  resvgWasmReady ??= initWasm(wasmModule);
  await resvgWasmReady;
};

const ensureSatoriReady = async (): Promise<void> => {
  // Satori 本体がバンドルする yoga wasm は動的コンパイルに依存するため、standalone ビルド + 静的 import した Module で初期化する
  satoriYogaReady ??= initSatoriYoga(satoriYogaWasm);
  await satoriYogaReady;
};

const renderOgImage = async (content: ReactNode): Promise<ArrayBuffer> => {
  await Promise.all([ensureResvgReady(), ensureSatoriReady()]);

  const svg = await satori(
    <div
      style={{
        backgroundColor: BACKGROUND_COLOR,
        display: "flex",
        height: "100%",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          backgroundImage: `url(${ICON_GRID_DATA_URI})`,
          backgroundRepeat: "repeat",
          backgroundSize: "480px 480px",
          bottom: 0,
          left: 0,
          opacity: 0.35,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      <div
        style={{
          alignItems: "center",
          bottom: 0,
          color: TEXT_COLOR,
          display: "flex",
          flexDirection: "column",
          fontFamily: FONT_FAMILY,
          justifyContent: "center",
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      >
        {content}
      </div>
    </div>,
    {
      fonts: [{ data: FONT_DATA, name: FONT_FAMILY, style: "normal", weight: FONT_WEIGHT }],
      height: OG_HEIGHT,
      width: OG_WIDTH,
    },
  );

  const resvg = new Resvg(svg, { font: { loadSystemFonts: false } });
  const png = resvg.render().asPng();
  // Uint8Array<ArrayBufferLike> は Response/Blob の BodyInit と型が噛み合わないため、素の ArrayBuffer にコピーする
  const buffer = new ArrayBuffer(png.byteLength);
  new Uint8Array(buffer).set(png);
  return buffer;
};

export type ShareOgImageInput = {
  correctFlags: boolean[];
  modeLabel: string;
  score: number;
  seedLabel: string;
};

export const renderShareOgImage = async (input: ShareOgImageInput): Promise<ArrayBuffer> =>
  await renderOgImage(
    <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 36 }}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          width: CARD_WIDTH,
        }}
      >
        <span style={{ fontSize: 34, fontWeight: FONT_WEIGHT, opacity: 0.85 }}>
          {input.modeLabel}
        </span>
        <span style={{ fontSize: 34, fontWeight: FONT_WEIGHT, opacity: 0.55 }}>
          {input.seedLabel}
        </span>
      </div>
      <div
        style={{
          alignItems: "center",
          backgroundColor: CARD_BACKGROUND_COLOR,
          border: `1px solid ${CARD_BORDER_COLOR}`,
          borderRadius: 32,
          display: "flex",
          flexDirection: "column",
          gap: 28,
          height: CARD_HEIGHT,
          justifyContent: "center",
          width: CARD_WIDTH,
        }}
      >
        <div style={{ alignItems: "flex-end", display: "flex", gap: 10 }}>
          <span style={{ fontSize: 200, fontWeight: FONT_WEIGHT, lineHeight: 1 }}>
            {input.score}
          </span>
          <span style={{ fontSize: 56, fontWeight: FONT_WEIGHT, marginBottom: 12, opacity: 0.55 }}>
            pt
          </span>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {input.correctFlags.map((correct, index) => (
            <div
              // 実データを diff/reconcile しない satori の静的レンダリングのため key は形式的なもので良い
              // oxlint-disable-next-line react/no-array-index-key
              key={index}
              style={{
                backgroundColor: correct ? CORRECT_COLOR : INCORRECT_COLOR,
                borderRadius: 14,
                height: 64,
                width: 64,
              }}
            />
          ))}
        </div>
      </div>
      <span style={{ fontSize: 26, fontWeight: FONT_WEIGHT, opacity: 0.55 }}>
        {SITE_URL_DISPLAY}
      </span>
    </div>,
  );

/** @public public/og-default.png 再生成用。wasm 初期化の都合上 dev サーバー越しにのみ呼び出せる */
export const renderDefaultOgImage = async (): Promise<ArrayBuffer> =>
  await renderOgImage(
    <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 20 }}>
      <span style={{ fontSize: 160, fontWeight: FONT_WEIGHT }}>Icondle</span>
      <span style={{ fontSize: 40, fontWeight: FONT_WEIGHT, opacity: 0.6 }}>
        {SITE_URL_DISPLAY}
      </span>
    </div>,
  );
