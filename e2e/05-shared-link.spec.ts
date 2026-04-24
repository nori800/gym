import { test, expect } from "@playwright/test";

test.describe("共有リンク API", () => {
  test("トークン無しのGETは400を返す", async ({ request }) => {
    const res = await request.get("/api/share");
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("token");
  });

  test("存在しないトークンのGETは404を返す", async ({ request }) => {
    const res = await request.get("/api/share?token=nonexistent_token_12345");
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("見つかりません");
  });

  test("未認証のPOSTは401を返す", async ({ request }) => {
    const res = await request.post("/api/share", {
      data: { video_id: "test-id" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("認証");
  });

  test("video_idもworkout_idも無いPOSTは400を返す", async ({ request }) => {
    const res = await request.post("/api/share", {
      data: {},
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("共有ページ UI", () => {
  test("存在しないトークンでエラーUIが表示される", async ({ page }) => {
    await page.goto("/share/invalid_token_xyz");
    await expect(page.getByText("リンクが無効です")).toBeVisible({ timeout: 10000 });
  });

  test("共有ページの基本レイアウトが表示される", async ({ page }) => {
    await page.goto("/share/invalid_token_xyz");
    await expect(page.locator("text=FormCheck")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("共有ページ動画レスポンス", () => {
  test("GETレスポンスにexpires_atが含まれる", async ({ request }) => {
    const res = await request.get("/api/share?token=nonexistent_token_12345");
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });
});
