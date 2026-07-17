import { expect, test, type Page } from "@playwright/test";

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(() => !("$_TSR" in window));
};

const jstToday = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).format(new Date());

const shiftDate = (dateSeed: string, days: number): string => {
  const date = new Date(dateSeed);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

test.describe("デイリーモード", () => {
  test("トップの「今日の問題に挑戦」から JST 日付シードのピック第1問へ遷移する", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.getByRole("link", { name: "今日の問題に挑戦" }).click();
    await expect(page).toHaveURL(new RegExp(`/pick/${jstToday()}/1$`));
  });

  test("日付シードは全5問構成で回答すると次の問題へ進める", async ({ page }) => {
    const date = jstToday();
    await page.goto(`/pick/${date}/1`);
    await waitForHydration(page);
    await expect(page.getByText("1 / 5 問")).toBeVisible();
    const buttons = page.getByRole("group", { name: "選択肢" }).getByRole("button");
    await buttons.first().click();
    await expect(page.getByRole("status")).toBeVisible();
    await page.getByRole("link", { name: "次の問題へ" }).click();
    await expect(page).toHaveURL(new RegExp(`/pick/${date}/2\\?a=[0-3]$`));
  });

  test("未来日付のシードは表示されない", async ({ page }) => {
    const response = await page.goto("/pick/2999-01-01/1");
    expect(response?.status()).toBe(404);
    const resultResponse = await page.goto("/pick/2999-01-01/result?a=00000");
    expect(resultResponse?.status()).toBe(404);
  });

  test("デイリーの結果ページに日付入りの共有ボタンが表示される", async ({ page }) => {
    const date = jstToday();
    await page.goto(`/pick/${date}/result?a=00000`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("問正解");
    await expect(page.getByRole("button", { name: "結果をコピーして共有" })).toBeVisible();
  });

  test("初回プレイでは連続記録ダイアログを表示しない", async ({ page }) => {
    const date = jstToday();
    await page.goto(`/pick/${date}/result?a=00000`);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("前日・前々日の記録があると連続記録ダイアログを表示する", async ({ page }) => {
    const date = jstToday();
    const yesterday = shiftDate(date, -1);
    const dayBeforeYesterday = shiftDate(date, -2);
    await page.addInitScript(
      (entries) => {
        window.localStorage.setItem("icondle:play-history", JSON.stringify(entries));
      },
      [
        {
          answers: "00000",
          game: "pick",
          mode: "easy",
          playedAt: 1,
          score: 3,
          seed: yesterday,
          total: 5,
        },
        {
          answers: "00000",
          game: "pick",
          mode: "easy",
          playedAt: 2,
          score: 3,
          seed: dayBeforeYesterday,
          total: 5,
        },
      ],
    );
    await page.goto(`/pick/${date}/result?a=00000`);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("3日連続");
    await dialog.getByRole("button", { name: "閉じる" }).click();
    await expect(dialog).toBeHidden();
  });
});
