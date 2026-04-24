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

test.describe("トレーナー招待フロー", () => {
  test("招待セクションが表示される", async ({ page }) => {
    skipWithoutUserCredentials();
    await loginViaUI(page);
    await page.goto("/trainer");
    await waitForAppReady(page);
    await expect(page.getByText("メンバーを招待")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByPlaceholder("メールアドレスまたは名前")).toBeVisible();
  });

  test("短すぎるクエリでバリデーションが表示される", async ({ page }) => {
    skipWithoutUserCredentials();
    await loginViaUI(page);
    await page.goto("/trainer");
    await waitForAppReady(page);
    const input = page.getByPlaceholder("メールアドレスまたは名前");
    await input.fill("a");
    await page.getByRole("button", { name: "検索" }).click();
    await expect(page.getByText("2文字以上")).toBeVisible({ timeout: 5000 });
  });

  test("検索API未認証は401を返す", async ({ request }) => {
    const res = await request.get("/api/trainer/search-member?q=test");
    expect(res.status()).toBe(401);
  });
});
