import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#38bdf8"/>
  <rect x="18" y="18" width="28" height="28" rx="8" fill="#0b1220"/>
</svg>
`;

const wasmPath = fileURLToPath(import.meta.resolve("@resvg/resvg-wasm/index_bg.wasm"));
await initWasm(readFileSync(wasmPath));

const renderPng = (size: number): Buffer => {
  const resvg = new Resvg(SVG, { fitTo: { mode: "width", value: size } });
  return Buffer.from(resvg.render().asPng());
};

type IcoImage = { png: Buffer; size: number };

const buildIco = (images: IcoImage[]): Buffer => {
  const headerSize = 6;
  const dirEntrySize = 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = headerSize + dirEntrySize * images.length;
  const dirEntries = images.map(({ png, size }) => {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.byteLength, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.byteLength;
    return entry;
  });

  return Buffer.concat([header, ...dirEntries, ...images.map(({ png }) => png)]);
};

const png16 = renderPng(16);
const png32 = renderPng(32);
const png180 = renderPng(180);

writeFileSync(
  fileURLToPath(new URL("../public/favicon.ico", import.meta.url)),
  buildIco([
    { png: png16, size: 16 },
    { png: png32, size: 32 },
  ]),
);
writeFileSync(fileURLToPath(new URL("../public/favicon.svg", import.meta.url)), SVG);
writeFileSync(fileURLToPath(new URL("../public/apple-touch-icon.png", import.meta.url)), png180);

console.warn("public/favicon.ico, favicon.svg, apple-touch-icon.png を生成しました");
