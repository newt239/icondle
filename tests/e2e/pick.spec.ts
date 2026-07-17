import { expect, test, type Page } from "@playwright/test";

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(() => !("$_TSR" in window));
};

const jstToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).format(new Date());

test.describe("ピックモード", () => {
  test("/pick からシード付きの第1問へリダイレクトされる", async ({ page }) => {
    await page.goto("/pick");
    await expect(page).toHaveURL(/\/pick\/[0-9a-f]{6}\/1$/);
  });

  test("回答すると解説が表示され次の問題へ進める", async ({ page }) => {
    await page.goto("/pick/e2etest/1");
    await waitForHydration(page);
    await expect(page.getByText("のアイコンは？")).toBeVisible();
    const buttons = page.getByRole("group", { name: "選択肢" }).getByRole("button");
    await expect(buttons).toHaveCount(4);
    await buttons.first().click();
    const status = page.getByRole("status");
    await expect(status).toBeVisible();
    await expect(status.getByRole("heading", { level: 2 })).toContainText(/正解/);
    await page.getByRole("link", { name: "次の問題へ" }).click();
    await expect(page).toHaveURL(/\/pick\/e2etest\/2\?a=[0-3]$/);
  });

  test("キーボードの数字キーで回答できる", async ({ page }) => {
    await page.goto("/pick/e2etest/1");
    await waitForHydration(page);
    await expect(page.getByRole("group", { name: "選択肢" }).getByRole("button")).toHaveCount(4);
    await expect(async () => {
      await page.keyboard.press("2");
      await expect(page.getByRole("status")).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 15000 });
  });

  test("初期 HTML に正解情報とセット固有の viewBox が漏れない", async ({ page }) => {
    const response = await page.goto("/pick/e2etest/1");
    const html = (await response?.text()) ?? "";
    expect(html.length).toBeGreaterThan(0);
    expect(html).not.toContain("answerIndex");
    const viewBoxes = html.match(/viewBox=\\?"[^"\\]+/g) ?? [];
    expect(viewBoxes.length).toBeGreaterThan(0);
    for (const viewBox of viewBoxes) {
      expect(viewBox).toContain("0 0 100 100");
    }
  });

  test("全問回答済みの結果ページが表示される", async ({ page }) => {
    await page.goto("/pick/e2etest/result?a=00000");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("pt");
    await expect(page.getByRole("button", { name: "Xでポストする" })).toBeVisible();
    await expect(page.locator('a[href^="https://icon-sets.iconify.design/"]')).toHaveCount(20);
    await expect(page.getByRole("link", { name: "もっとプレイする" })).toHaveAttribute(
      "href",
      "/pick",
    );
  });

  test("回答が揃っていない結果ページは空状態を表示する", async ({ page }) => {
    await page.goto("/pick/e2etest/result?a=01");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("結果を表示できません");
  });
});

test.describe("ピックモード（難しい）", () => {
  test("/pick/hard からシード付きの第1問へリダイレクトされる", async ({ page }) => {
    await page.goto("/pick/hard");
    await expect(page).toHaveURL(/\/pick\/hard\/[0-9a-f]{6}\/1$/);
  });

  test("回答すると解説が表示され次の問題へ進める", async ({ page }) => {
    await page.goto("/pick/hard/e2etest/1");
    await waitForHydration(page);
    const buttons = page.getByRole("group", { name: "選択肢" }).getByRole("button");
    await expect(buttons).toHaveCount(4);
    await buttons.first().click();
    await expect(page.getByRole("status")).toBeVisible();
    await page.getByRole("link", { name: "次の問題へ" }).click();
    await expect(page).toHaveURL(/\/pick\/hard\/e2etest\/2\?a=[0-3]$/);
  });

  test("全問回答済みの結果ページが表示される", async ({ page }) => {
    await page.goto("/pick/hard/e2etest/result?a=0000000000");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("pt");
    await expect(page.getByRole("link", { name: "もっとプレイする" })).toHaveAttribute(
      "href",
      "/pick/hard",
    );
  });

  test("日付シードの出題ページは 404 になる", async ({ page }) => {
    const response = await page.goto(`/pick/hard/${jstToday()}/1`);
    expect(response?.status()).toBe(404);
  });

  test("日付シードの結果ページは 404 になる", async ({ page }) => {
    const response = await page.goto(`/pick/hard/${jstToday()}/result?a=00000`);
    expect(response?.status()).toBe(404);
  });
});
