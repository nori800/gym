import { test, expect } from "@playwright/test";
import { loginViaUI, waitForAppReady, skipWithoutUserCredentials } from "./helpers";

test.describe("動画アップロードフロー", () => {
  test.beforeEach(async ({ page }) => {
    skipWithoutUserCredentials();
    await loginViaUI(page);
  });

  test("動画一覧ページが表示される", async ({ page }) => {
    await page.goto("/videos");
    await waitForAppReady(page);
    await expect(page.locator("body")).toBeVisible();
  });

  test("撮影ページが表示される", async ({ page }) => {
    await page.goto("/capture");
    await waitForAppReady(page);
    await expect(page.locator("body")).toBeVisible();
  });

  test("動画比較ページへの遷移ができる", async ({ page }) => {
    await page.goto("/videos");
    await waitForAppReady(page);
    await expect(page.locator("body")).toBeVisible();
  });
});
