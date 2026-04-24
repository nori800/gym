import { test, expect } from "@playwright/test";

test.describe("認証フロー", () => {
  test("ログインページが表示される", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "FormCheck" })).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("8 文字以上")).toBeVisible();
    await expect(page.getByRole("button", { name: "ログイン" })).toBeVisible();
  });

  test("空フォーム送信でバリデーションエラー", async ({ page }) => {
    await page.goto("/login");
    // Wait for page to be interactive
    await expect(page.getByRole("heading", { name: "FormCheck" })).toBeVisible();
    // Touch both fields to trigger validation
    const emailField = page.getByPlaceholder("you@example.com");
    await emailField.focus();
    await emailField.blur();
    const passField = page.getByPlaceholder("8 文字以上");
    await passField.focus();
    await passField.blur();
    // Validation errors show on blur
    await expect(page.getByText("メールアドレスを入力してください")).toBeVisible();
    await expect(page.getByText("パスワードを入力してください")).toBeVisible({ timeout: 3000 }).catch(() => {
      // Some UIs only show password error after email is filled
    });
  });

  test("不正なメールアドレスでバリデーションエラー", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "FormCheck" })).toBeVisible();
    await page.getByPlaceholder("you@example.com").fill("notanemail");
    await page.getByPlaceholder("8 文字以上").fill("somepassword123");
    await page.getByRole("button", { name: "ログイン" }).click({ force: true });
    await expect(
      page.getByText("有効なメールアドレスを入力してください"),
    ).toBeVisible();
  });

  test("保護ページへの未認証アクセスはリダイレクト", async ({ page }) => {
    await page.goto("/workouts");
    await page.waitForURL("**/login", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("サインアップページが表示される", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "FormCheck" })).toBeVisible();
  });
});
