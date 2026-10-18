import { expect, test } from '@playwright/test';

test.describe('Comparison site', () => {
  test('theme dropdown sets, persists, and restyles the embedded demos', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const trigger = page.getByRole('button', { name: /^Color theme/ });
    const menu = page.getByRole('menu', { name: 'Color theme' });
    const option = (name: string) => menu.getByRole('menuitemradio', { name });

    await expect(trigger).toHaveAccessibleName('Color theme: System');
    await expect(menu).toBeHidden();
    await expect(html).not.toHaveAttribute('data-color-scheme', /.*/);

    await trigger.click();
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(option('System')).toHaveAttribute('aria-checked', 'true');
    await option('Dark').click();
    await expect(menu).toBeHidden();
    await expect(html).toHaveAttribute('data-color-scheme', 'dark');
    await expect(trigger).toHaveAccessibleName('Color theme: Dark');

    // The embedded demos pick up the choice, including after switching framework.
    await page.locator('#demos').scrollIntoViewIfNeeded();
    const leftFrame = page.frameLocator('[data-pane="left"] iframe');
    await expect(leftFrame.locator('html')).toHaveAttribute('data-color-scheme', 'dark');
    await page.locator('[data-pane="left"]').getByRole('button', { name: 'Vue' }).click();
    await expect(leftFrame.locator('.app')).toHaveAttribute('data-framework', 'vue');
    await expect(leftFrame.locator('html')).toHaveAttribute('data-color-scheme', 'dark');

    // Persists across reloads.
    await page.reload();
    await expect(html).toHaveAttribute('data-color-scheme', 'dark');
    await expect(trigger).toHaveAccessibleName('Color theme: Dark');
  });

  test('theme dropdown works from the keyboard', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: /^Color theme/ });
    const menu = page.getByRole('menu', { name: 'Color theme' });

    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitemradio', { name: 'System' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitemradio', { name: 'Light' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'light');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(menu.getByRole('menuitemradio', { name: 'Light' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'light');
  });
});
