import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

const waitForHydration = (page: Page) => page.waitForFunction(() => !("$_TSR" in window));

const jstToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).format(new Date());

test.describe("難しいモード", () => {
  test("/play/hard からシード付きの第1問へリダイレクトされる", async ({ page }) => {
    await page.goto("/play/hard");
    await expect(page).toHaveURL(/\/play\/hard\/[0-9a-f]{6}\/1$/);
  });

  test("回答すると解説が表示され次の問題へ進める", async ({ page }) => {
    await page.goto("/play/hard/e2etest/1");
    await waitForHydration(page);
    const buttons = page.getByRole("group", { name: "選択肢" }).getByRole("button");
    await expect(buttons).toHaveCount(4);
    await buttons.first().click();
    const status = page.getByRole("status");
    await expect(status).toBeVisible();
    await expect(status.getByRole("heading", { level: 2 })).toContainText(/正解/);
    await page.getByRole("link", { name: "次の問題へ" }).click();
    await expect(page).toHaveURL(/\/play\/hard\/e2etest\/2\?a=[0-3]$/);
  });

  test("全問回答済みの結果ページが表示される", async ({ page }) => {
    await page.goto("/play/hard/e2etest/result?a=0000000000");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("問正解");
    await expect(page.getByRole("button", { name: "結果をコピーして共有" })).toBeVisible();
    await expect(page.locator('a[href^="https://icon-sets.iconify.design/"]')).toHaveCount(10);
    await expect(page.getByRole("link", { name: "もう一度遊ぶ" })).toHaveAttribute(
      "href",
      "/play/hard",
    );
  });

  test("日付シードの出題ページは 404 になる", async ({ page }) => {
    const response = await page.goto(`/play/hard/${jstToday()}/1`);
    expect(response?.status()).toBe(404);
  });

  test("日付シードの結果ページは 404 になる", async ({ page }) => {
    const response = await page.goto(`/play/hard/${jstToday()}/result?a=00000`);
    expect(response?.status()).toBe(404);
  });
});
