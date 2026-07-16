import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

const waitForHydration = (page: Page) => page.waitForFunction(() => !("$_TSR" in window));

const jstToday = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).format(new Date());

test.describe("デイリーモード", () => {
  test("トップの「今日のデイリー」から JST 日付シードの第1問へ遷移する", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.getByRole("link", { name: "今日のデイリー" }).click();
    await expect(page).toHaveURL(new RegExp(`/play/${jstToday()}/1$`));
  });

  test("日付シードは全5問構成で回答すると次の問題へ進める", async ({ page }) => {
    const date = jstToday();
    await page.goto(`/play/${date}/1`);
    await waitForHydration(page);
    await expect(page.getByText("1 / 5 問")).toBeVisible();
    const buttons = page.getByRole("group", { name: "選択肢" }).getByRole("button");
    await buttons.first().click();
    await expect(page.getByRole("status")).toBeVisible();
    await page.getByRole("link", { name: "次の問題へ" }).click();
    await expect(page).toHaveURL(new RegExp(`/play/${date}/2\\?a=[0-3]$`));
  });

  test("未来日付のシードは表示されない", async ({ page }) => {
    const response = await page.goto("/play/2999-01-01/1");
    expect(response?.status()).toBe(404);
    const resultResponse = await page.goto("/play/2999-01-01/result?a=00000");
    expect(resultResponse?.status()).toBe(404);
  });

  test("デイリーの結果ページに日付入りの共有ボタンが表示される", async ({ page }) => {
    const date = jstToday();
    await page.goto(`/play/${date}/result?a=00000`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("問正解");
    await expect(page.getByRole("button", { name: "結果をコピーして共有" })).toBeVisible();
  });
});
