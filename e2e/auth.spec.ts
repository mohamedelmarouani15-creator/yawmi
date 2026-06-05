import { test, expect } from "@playwright/test";

test.describe("Authentification — page inscription", () => {
  test("la page /inscription charge correctement", async ({ page }) => {
    await page.goto("/inscription");
    await expect(page).toHaveURL(/inscription/);
  });

  test("les champs email et mot de passe sont présents", async ({ page }) => {
    await page.goto("/inscription");
    // Champ email
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput.first()).toBeVisible();
    // Champ mot de passe
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]'
    );
    await expect(passwordInput.first()).toBeVisible();
  });

  test("la navigation vers /connexion fonctionne depuis /inscription", async ({
    page,
  }) => {
    await page.goto("/inscription");
    // Cherche un lien vers /connexion
    const loginLink = page.locator('a[href*="connexion"]').first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/connexion/);
  });
});
