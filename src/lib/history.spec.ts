import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearPlayHistory,
  PLAY_HISTORY_STORAGE_KEY,
  readPlayHistory,
  savePlayHistoryEntry,
  type PlayHistoryEntry,
} from "./history";

const createEntry = (overrides: Partial<PlayHistoryEntry> = {}): PlayHistoryEntry => ({
  answers: "0000",
  game: "play",
  mode: "easy",
  playedAt: 1,
  score: 3,
  seed: "a7f3c2",
  total: 5,
  ...overrides,
});

const createLocalStorageStub = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => store.set(key, value),
  };
};

beforeEach(() => {
  vi.stubGlobal("localStorage", createLocalStorageStub());
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
});

describe("readPlayHistory", () => {
  it("何も保存されていない場合は空配列を返す", () => {
    expect(readPlayHistory()).toEqual([]);
  });

  it("壊れた JSON が保存されている場合は空配列を返す", () => {
    localStorage.setItem(PLAY_HISTORY_STORAGE_KEY, "{invalid");
    expect(readPlayHistory()).toEqual([]);
  });

  it("スキーマに合わないデータが保存されている場合は空配列を返す", () => {
    localStorage.setItem(PLAY_HISTORY_STORAGE_KEY, JSON.stringify([{ foo: "bar" }]));
    expect(readPlayHistory()).toEqual([]);
  });
});

describe("savePlayHistoryEntry", () => {
  it("保存したエントリを読み出せる", () => {
    const entry = createEntry();
    savePlayHistoryEntry(entry);
    expect(readPlayHistory()).toEqual([entry]);
  });

  it("game・mode・seed が同じエントリは上書きされる(件数が増えない)", () => {
    savePlayHistoryEntry(createEntry({ answers: "0000", playedAt: 1, score: 2 }));
    savePlayHistoryEntry(createEntry({ answers: "0001", playedAt: 2, score: 3 }));
    const history = readPlayHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ answers: "0001", score: 3 });
  });

  it("playedAt の降順に並び替える", () => {
    savePlayHistoryEntry(createEntry({ playedAt: 1, seed: "seed-1" }));
    savePlayHistoryEntry(createEntry({ playedAt: 3, seed: "seed-2" }));
    savePlayHistoryEntry(createEntry({ playedAt: 2, seed: "seed-3" }));
    expect(readPlayHistory().map((entry) => entry.seed)).toEqual(["seed-2", "seed-3", "seed-1"]);
  });

  it("50 件を超えると古いものから切り詰められる", () => {
    for (let i = 0; i < 60; i += 1) {
      savePlayHistoryEntry(createEntry({ playedAt: i, seed: `seed-${i}` }));
    }
    const history = readPlayHistory();
    expect(history).toHaveLength(50);
    expect(history[0]?.seed).toBe("seed-59");
    expect(history.at(-1)?.seed).toBe("seed-10");
  });
});

describe("clearPlayHistory", () => {
  it("保存済みの履歴をすべて削除する", () => {
    savePlayHistoryEntry(createEntry());
    clearPlayHistory();
    expect(readPlayHistory()).toEqual([]);
  });
});
