import { describe, expect, it } from "vitest";

import { normalize } from "./render-icon.server";

describe("normalize", () => {
  it("viewBox を 0 0 100 100 に包み直す", () => {
    const svg = normalize({ body: '<path d="M0 0h24v24H0z"/>', height: 24 });
    expect(svg).toContain('viewBox="0 0 100 100"');
    expect(svg.match(/viewBox/g)).toHaveLength(1);
  });

  it("256 グリッドの元 viewBox が出力に残らない", () => {
    const svg = normalize({ body: '<path d="M0 0h256v256H0z"/>', height: 256 });
    expect(svg).not.toContain('viewBox="0 0 256 256"');
    expect(svg).toContain(`scale(${100 / 256})`);
  });

  it("16 グリッドの元 viewBox が出力に残らない", () => {
    const svg = normalize({ body: '<path d="M0 0h16v16H0z"/>', height: 16 });
    expect(svg).not.toContain('viewBox="0 0 16 16"');
    expect(svg).toContain(`scale(${100 / 16})`);
  });

  it("stroke-width や linecap は正規化せず body をそのまま保つ", () => {
    const body = '<path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 4"/>';
    const svg = normalize({ body, height: 24 });
    expect(svg).toContain(body);
  });

  it("role と aria-label で出題中であることのみを示す", () => {
    const svg = normalize({ body: "<path/>", height: 24 });
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="出題中のアイコン"');
  });
});
