import { test, expect } from "@playwright/test";
import { loginViaUI, waitForAppReady, skipWithoutUserCredentials } from "./helpers";

test.describe("ワークアウト CRUD", () => {
  test.beforeEach(async ({ page }) => {
    skipWithoutUserCredentials();
    await loginViaUI(page);
  });

  test("ワークアウト一覧ページが表示される", async ({ page }) => {
    await page.goto("/workouts");
    await waitForAppReady(page);
    await expect(page.locator("body")).toBeVisible();
  });

  test("新規ワークアウト作成画面を開ける", async ({ page }) => {
    await page.goto("/workouts/edit");
    await waitForAppReady(page);
    await expect(page.getByPlaceholder("ワークアウト名を入力")).toBeVisible();
    await expect(page.getByText("種目を追加してワークアウトを組みましょう")).toBeVisible();
  });

  test("ワークアウト名を編集できる", async ({ page }) => {
    await page.goto("/workouts/edit");
    await waitForAppReady(page);
    const input = page.getByPlaceholder("ワークアウト名を入力");
    await input.click();
    await input.fill("E2Eテストワークアウト");
    await expect(input).toHaveValue("E2Eテストワークアウト");
  });

  test("ブロック追加ボタンが表示される", async ({ page }) => {
    await page.goto("/workouts/edit");
    await waitForAppReady(page);
    await expect(page.getByText("ブロック")).toBeVisible();
  });
});
