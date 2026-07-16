import { expect, test } from "@playwright/test";

test.describe("ホームページ", () => {
  test("Guess Icon の見出しが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Guess Icon" })).toBeVisible();
  });

  test("むずかしいモードへのリンクが表示されない", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "むずかしい" })).toHaveCount(0);
  });

  test("アイコンを当てるのプレイするからピックの第1問へ遷移できる", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: "プレイする" })
      .and(page.locator('[href="/pick"]'))
      .click();
    await expect(page).toHaveURL(/\/pick\/[0-9a-f]{6}\/1$/);
  });
});
