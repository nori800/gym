import { Page, test } from "@playwright/test";

export function hasUserCredentials(): boolean {
  return !!(process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD);
}

export function hasTrainerCredentials(): boolean {
  return !!(process.env.E2E_TRAINER_EMAIL && process.env.E2E_TRAINER_PASSWORD);
}

/**
 * Authenticate via the login page UI.
 * Requires E2E_USER_EMAIL and E2E_USER_PASSWORD env vars.
 */
export async function loginViaUI(page: Page) {
  const email = process.env.E2E_USER_EMAIL!;
  const password = process.env.E2E_USER_PASSWORD!;

  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("8 文字以上").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click({ force: true });

  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

/**
 * Authenticate via the login page UI with a trainer account.
 * Requires E2E_TRAINER_EMAIL and E2E_TRAINER_PASSWORD env vars.
 */
export async function loginAsTrainer(page: Page) {
  const email = process.env.E2E_TRAINER_EMAIL!;
  const password = process.env.E2E_TRAINER_PASSWORD!;

  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("8 文字以上").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click({ force: true });

  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

/**
 * Skip a test.describe block when user credentials are not set.
 */
export function skipWithoutUserCredentials() {
  test.skip(!hasUserCredentials(), "E2E_USER_EMAIL / E2E_USER_PASSWORD 環境変数が未設定");
}

/**
 * Wait for network-based loading to settle.
 */
export async function waitForAppReady(page: Page, timeout = 10_000) {
  await page.waitForLoadState("networkidle", { timeout });
}
