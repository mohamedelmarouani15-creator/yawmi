import { test, expect } from "@playwright/test";

test.describe("Authentification", () => {
  test("page /inscription charge et affiche les champs", async ({ page }) => {
    await page.goto("/inscription");
    await expect(page.locator("h1, h2").filter({ hasText: /compte/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("lien vers /connexion présent sur /inscription", async ({ page }) => {
    await page.goto("/inscription");
    const link = page.locator('a[href*="connexion"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/connexion/);
  });

  test("page /connexion affiche email + mot de passe", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("mot de passe oublié accessible depuis /connexion", async ({ page }) => {
    await page.goto("/connexion");
    const link = page.locator('a[href*="mot-de-passe"]').first();
    await expect(link).toBeVisible();
  });

  test("erreur affichée si email invalide à l'inscription", async ({ page }) => {
    await page.goto("/inscription");
    await page.fill('input[type="email"]', "pas-un-email");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    // Le navigateur affiche une validation HTML5 native — l'email reste invalide
    const emailInput = page.locator('input[type="email"]');
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBe(false);
  });
});
