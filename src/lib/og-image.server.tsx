import "@tanstack/react-start/server-only";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import wasmModule from "@resvg/resvg-wasm/index_bg.wasm";
import satori, { init as initSatoriYoga } from "satori/standalone";
import satoriYogaWasm from "satori/yoga.wasm";

// トップページ背景と同じ public/bg-icons.svg を OGP 画像でも再利用するための例外的な相対 import
// oxlint-disable-next-line import/no-relative-parent-imports
import bgIconsSvgRaw from "../../public/bg-icons.svg?raw";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const FONT_FAMILY = "Noto Sans JP";
const FONT_WEIGHT = 700;
const ICON_GRID_COLOR = "#334155";

const buildIconGridDataUri = (): string => {
  const withoutComment = bgIconsSvgRaw.replace(/<!--[\s\S]*?-->/, "");
  const colored = withoutComment.replaceAll("currentColor", ICON_GRID_COLOR);
  return `data:image/svg+xml;base64,${btoa(colored)}`;
};

const ICON_GRID_DATA_URI = buildIconGridDataUri();

const OLD_CHROME_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36";

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

const extractFontUrl = (css: string): string | null => {
  const match = /src:\s*url\((?<url>[^)]+)\)/.exec(css);
  return match?.groups?.url?.replaceAll(/["']/g, "") ?? null;
};

const fetchFont = async (text: string): Promise<ArrayBuffer> => {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(FONT_FAMILY)}:wght@${FONT_WEIGHT}&text=${encodeURIComponent(text)}`;
  const cache = caches.default;
  const cacheKey = new Request(cssUrl);
  const cached = await cache.match(cacheKey);
  if (cached) {
    return await cached.arrayBuffer();
  }
  const cssResponse = await fetch(cssUrl, { headers: { "user-agent": OLD_CHROME_USER_AGENT } });
  const css = await cssResponse.text();
  const fontUrl = extractFontUrl(css);
  if (!fontUrl) {
    throw new Error("OGP画像用フォントの取得に失敗しました。");
  }
  const fontResponse = await fetch(fontUrl);
  const fontBuffer = await fontResponse.arrayBuffer();
  await cache.put(
    cacheKey,
    new Response(fontBuffer, { headers: { "cache-control": "public, max-age=604800" } }),
  );
  return fontBuffer;
};

export type ShareOgImageInput = {
  label: string;
  score: number;
  total: number;
  correctFlags: boolean[];
};

export const renderShareOgImage = async (input: ShareOgImageInput): Promise<ArrayBuffer> => {
  const scoreText = `${input.score} / ${input.total}`;
  const caption = "問正解";
  const text = `${input.label}${scoreText}${caption}Icondle`;

  const [fontData] = await Promise.all([fetchFont(text), ensureResvgReady(), ensureSatoriReady()]);

  const svg = await satori(
    <div
      style={{
        backgroundColor: "#0b1220",
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
          color: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          fontFamily: FONT_FAMILY,
          justifyContent: "space-between",
          left: 0,
          padding: 64,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span style={{ fontSize: 32, fontWeight: FONT_WEIGHT, opacity: 0.85 }}>Icondle</span>
          <span style={{ fontSize: 28, opacity: 0.6 }}>{input.label}</span>
        </div>
        <div style={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 160, fontWeight: FONT_WEIGHT, lineHeight: 1 }}>{scoreText}</span>
          <span style={{ fontSize: 36, marginTop: 16, opacity: 0.75 }}>{caption}</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {input.correctFlags.map((correct, index) => (
            <div
              // 実データを diff/reconcile しない satori の静的レンダリングのため key は形式的なもので良い
              // oxlint-disable-next-line react/no-array-index-key
              key={index}
              style={{
                backgroundColor: correct ? "#34d399" : "#475569",
                borderRadius: 10,
                height: 40,
                width: 40,
              }}
            />
          ))}
        </div>
      </div>
    </div>,
    {
      fonts: [{ data: fontData, name: FONT_FAMILY, style: "normal", weight: FONT_WEIGHT }],
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
