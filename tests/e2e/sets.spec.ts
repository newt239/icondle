import { expect, test, type Page } from "@playwright/test";

const waitForHydration = async (page: Page) => {
  await page.waitForFunction(() => !("$_TSR" in window));
};

test.describe("収録アイコンセット", () => {
  test("トップページから一覧ページへ遷移できる", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.getByRole("link", { name: "収録アイコンセット" }).click();
    await expect(page).toHaveURL(/\/sets$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("収録アイコンセット");
  });

  test("14 セットぶんのカードとサンプルアイコンが表示される", async ({ page }) => {
    await page.goto("/sets");
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(14);
    expect(await page.locator("main svg").count()).toBeGreaterThanOrEqual(14);
    await expect(page.getByRole("link", { name: "Tabler Icons" })).toHaveAttribute(
      "href",
      "https://icon-sets.iconify.design/tabler/",
    );
  });
});
