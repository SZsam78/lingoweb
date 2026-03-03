import { test, expect } from '@playwright/test';

test.describe('Lesson Editor Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173'); // Adjust to your dev server URL
    });

    test('should navigate to a lesson and open the editor', async ({ page }) => {
        // 1. Click on a module (e.g., A1.1)
        await page.click('text=A1.1');

        // 2. Click on a lesson (e.g., Lektion 1)
        await page.click('text=Guten Tag!');

        // 3. Verify Player is visible
        await expect(page.locator('button:has-text("Bearbeiten")')).toBeVisible();

        // 4. Click Bearbeiten
        await page.click('text=Bearbeiten');

        // 5. Verify Editor is visible
        await expect(page.locator('h2:has-text("Lektion bearbeiten")')).toBeVisible();

        // 6. Verify first section accordion is present
        await expect(page.locator('text=Einstieg')).toBeVisible();
    });

    test('should add a new item type to a section', async ({ page }) => {
        await page.click('text=A1.1');
        await page.click('text=Guten Tag!');
        await page.click('text=Bearbeiten');

        // Open "Verstehen" section
        await page.click('text=Verstehen');

        // Click "Aufgabe hinzufügen"
        await page.click('text=Aufgabe hinzufügen');

        // Verify a new multiple_choice item block appears
        await expect(page.locator('text=MULTIPLE_CHOICE')).toBeVisible();
    });

    test('should navigate Back and Home from the Editor', async ({ page }) => {
        await page.click('text=A1.1');
        await page.click('text=Guten Tag!');
        await page.click('text=Bearbeiten');

        // 1. Verify Back navigation works
        await page.click('button:has-text("Zurück")');
        await expect(page.locator('h2:has-text("A1.1")')).toBeVisible();
        await expect(page.locator('text=Lektion bearbeiten')).toBeHidden();

        // 2. Go back into editor, verify Home navigation works
        await page.click('text=Guten Tag!');
        await page.click('text=Bearbeiten');
        await page.click('button:has-text("Home")'); // Home icon in Breadcrumbs or global nav
        // Note: adjust selector if Home is specifically an icon button. The Header component uses a Home icon.

        // Wait for ModuleGrid to appear
        await expect(page.locator('text=LingoLume Lernplattform')).toBeVisible();
        await expect(page.locator('h3:has-text("Guten Tag!")')).toBeHidden();
    });
});
