import { expect, test } from "@playwright/test";

test.describe("ホームページ", () => {
  test("Guess Icon の見出しが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Guess Icon" })).toBeVisible();
  });

  test("難しいモードでプレイのリンクから hard の第1問へ遷移できる", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "難しいモードでプレイ" }).click();
    await expect(page).toHaveURL(/\/play\/hard\/[0-9a-f]{6}\/1$/);
  });
});
