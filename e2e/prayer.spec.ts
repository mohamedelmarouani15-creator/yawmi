import { test, expect } from "@playwright/test";

test.describe("Horaires des prières — /prieres", () => {
  test("la page /prieres charge sans erreur critique", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/prieres");
    // Attend que la page soit chargée (pas de spinner ou erreur fatale)
    await page.waitForLoadState("domcontentloaded");

    // La page ne doit pas afficher une erreur 404 ou 500
    await expect(page).not.toHaveURL(/404|500/);
    expect(errors.filter((e) => !e.includes("hydration"))).toHaveLength(0);
  });

  test("les noms des prières sont affichés sur /prieres", async ({ page }) => {
    await page.goto("/prieres");
    await page.waitForLoadState("networkidle");

    // Au moins un nom de prière doit être visible parmi Fajr, Dhuhr, Asr, Maghrib, Isha
    const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    let found = 0;
    for (const name of prayerNames) {
      const el = page.getByText(name, { exact: false });
      const count = await el.count();
      if (count > 0) found++;
    }
    expect(found).toBeGreaterThan(0);
  });

  test("des éléments affichant des horaires (format HH:MM) sont présents", async ({
    page,
  }) => {
    await page.goto("/prieres");
    await page.waitForLoadState("networkidle");

    // Cherche un texte correspondant à un format d'heure HH:MM
    const timePattern = /\d{1,2}:\d{2}/;
    const bodyText = await page.locator("body").innerText();
    expect(timePattern.test(bodyText)).toBe(true);
  });
});
