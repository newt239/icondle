import { expect, test } from "@playwright/test";

test.describe("ホームページ", () => {
  test("Guess Icon の見出しが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Guess Icon" })).toBeVisible();
  });

  test("セット名を当てる（難しい）のリンクから hard の第1問へ遷移できる", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "セット名を当てる（難しい）" }).click();
    await expect(page).toHaveURL(/\/play\/hard\/[0-9a-f]{6}\/1$/);
  });

  test("アイコンを当てるのリンクからピックの第1問へ遷移できる", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { exact: true, name: "アイコンを当てる" }).click();
    await expect(page).toHaveURL(/\/pick\/[0-9a-f]{6}\/1$/);
  });
});
