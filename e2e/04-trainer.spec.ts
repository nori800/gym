import { test, expect } from "@playwright/test";
import { loginViaUI, waitForAppReady, skipWithoutUserCredentials } from "./helpers";

test.describe("トレーナー閲覧", () => {
  test("トレーナーページが保護されている", async ({ page }) => {
    await page.goto("/trainer");
    await page.waitForURL("**/login", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("通常ユーザーはトレーナーページにアクセスできる", async ({ page }) => {
    skipWithoutUserCredentials();
    await loginViaUI(page);
    await page.goto("/trainer");
    await waitForAppReady(page);
    await expect(page.locator("body")).toBeVisible();
  });
});
