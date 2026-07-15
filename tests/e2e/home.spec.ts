import { expect, test } from "@playwright/test";

test.describe("ホームページ", () => {
  test("Iconoclast の見出しが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Iconoclast" })).toBeVisible();
  });
});
