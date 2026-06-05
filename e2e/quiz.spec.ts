import { test, expect } from "@playwright/test";

test.describe("Flux onboarding", () => {
  test("onboarding étape 1 visible au chargement", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("domcontentloaded");
    // La première étape doit afficher du contenu
    await expect(page.locator("main, body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
  });

  test("inscription — champs présents et bouton submit actif", async ({ page }) => {
    await page.goto("/inscription");
    const email = page.locator('input[type="email"]');
    const pass  = page.locator('input[type="password"]');
    const btn   = page.locator('button[type="submit"]');
    await expect(email).toBeVisible();
    await expect(pass).toBeVisible();
    await expect(btn).toBeVisible();
    await expect(btn).not.toBeDisabled();
  });

  test("inscription — email invalide bloque le submit natif", async ({ page }) => {
    await page.goto("/inscription");
    await page.fill('input[type="email"]', "invalide");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    const valid = await page.locator('input[type="email"]').evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(valid).toBe(false);
  });

  test("connexion — formulaire présent", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("liens entre inscription et connexion fonctionnent", async ({ page }) => {
    await page.goto("/inscription");
    await page.locator('a[href*="connexion"]').first().click();
    await expect(page).toHaveURL(/connexion/);
    const backLink = page.locator('a[href*="inscription"]').first();
    if (await backLink.count() > 0) {
      await backLink.click();
      await expect(page).toHaveURL(/inscription/);
    }
  });
});
