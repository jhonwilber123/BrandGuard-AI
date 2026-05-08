const { test, expect } = require('@playwright/test');

test.describe('Autenticación y RBAC', () => {
  test('Flujo de Creador - Ingreso al Creative Engine', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=BrandGuard AI')).toBeVisible();

    await page.fill('input[placeholder="Ej. creador1"]', 'creador1');
    await page.fill('input[type="password"]', 'pwd');
    
    await page.click('button:has-text("Ingresar")');

    await expect(page.locator('text=Creative Engine')).toBeVisible();
    await expect(page.locator('text=Rol Activo: creator')).toBeVisible();
  });

  test('Flujo de Aprobador A - Ingreso al Brand DNA Architect', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder="Ej. creador1"]', 'aprobador1');
    await page.fill('input[type="password"]', 'pwd');
    await page.click('button:has-text("Ingresar")');

    await expect(page.locator('text=Brand DNA Architect')).toBeVisible();
    await expect(page.locator('text=Rol Activo: approver_a')).toBeVisible();
  });
});
