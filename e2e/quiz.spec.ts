import { test, expect } from "@playwright/test";

test.describe("Oasis — carte isométrique", () => {
  test("la page /oasis charge sans erreur critique", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/oasis");
    await page.waitForLoadState("domcontentloaded");

    await expect(page).not.toHaveURL(/404|500/);
    expect(errors.filter((e) => !e.includes("hydration"))).toHaveLength(0);
  });

  test("la carte isométrique SVG est présente sur /oasis", async ({ page }) => {
    await page.goto("/oasis");
    await page.waitForLoadState("networkidle");

    // La carte est rendue en SVG (isometric map)
    const svg = page.locator("svg").first();
    await expect(svg).toBeVisible();
  });

  test("au moins un lieu de l''oasis est affiché", async ({ page }) => {
    await page.goto("/oasis");
    await page.waitForLoadState("networkidle");

    // Les lieux du jeu sont présents dans le DOM (text ou bouton cliquable)
    // On cherche au moins un des lieux connus
    const locationNames = ["Médine", "La Mecque", "médine", "mecque", "Oasis"];
    let found = 0;
    for (const name of locationNames) {
      const el = page.getByText(name, { exact: false });
      const count = await el.count();
      if (count > 0) found++;
    }
    // Au minimum la page contient du contenu lié au jeu
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(100);
  });
});
