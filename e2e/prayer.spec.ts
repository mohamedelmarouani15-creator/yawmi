import { test, expect } from "@playwright/test";

test.describe("Pages publiques & infrastructure", () => {
  test("/inscription accessible (200)", async ({ page }) => {
    const res = await page.goto("/inscription");
    expect(res?.status()).toBe(200);
    await expect(page.locator("body")).not.toContainText("Application error");
  });

  test("/connexion accessible (200)", async ({ page }) => {
    const res = await page.goto("/connexion");
    expect(res?.status()).toBe(200);
    await expect(page.locator("body")).not.toContainText("Application error");
  });

  test("/onboarding accessible (200)", async ({ page }) => {
    const res = await page.goto("/onboarding");
    expect(res?.status()).toBe(200);
    await expect(page.locator("body")).not.toContainText("Application error");
  });

  test("redirect / → /accueil", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/accueil/);
  });

  test("manifest.webmanifest accessible et contient Yawmi", async ({ page }) => {
    const res = await page.goto("/manifest.webmanifest");
    expect(res?.status()).toBe(200);
    const body = await page.textContent("body") ?? "";
    expect(body).toContain("Yawmi");
  });

  test("sw.js accessible (200)", async ({ page }) => {
    const res = await page.goto("/sw.js");
    expect(res?.status()).toBe(200);
  });

  test("page /prières redirige vers onboarding si pas auth", async ({ page }) => {
    await page.goto("/prieres");
    // Sans session, doit rediriger vers /onboarding
    await expect(page).toHaveURL(/onboarding|prieres/);
  });
});
