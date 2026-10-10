// One spec, every framework. If an implementation drifts from the shared
// behaviour, its block fails here.
import { expect, test } from '@playwright/test';
import { FRAMEWORKS } from '@compare/core';

// Saturday 10 October 2026, noon in New York (the configured timezone).
const NOW = new Date('2026-10-10T12:00:00-04:00');

for (const fw of FRAMEWORKS) {
  test.describe(fw.name, () => {
    test.beforeEach(async ({ page }) => {
      // Freeze Date at NOW while timers keep running in real time. (Pausing timers
      // too would also stall zoneless Angular, which schedules rendering with them.)
      await page.clock.setFixedTime(NOW);
      await page.goto(`/demos/${fw.id}/`);
    });

    test('counts down to the soonest holiday and ticks', async ({ page }) => {
      await expect(page.locator('.app')).toHaveAttribute('data-framework', fw.id);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Halloween');
      await expect(page.locator('.hero-date')).toHaveText('Saturday, October 31, 2026');
      await expect(page.locator('[data-unit="days"] .unit-value')).toHaveText('20');
      await expect(page.locator('[data-unit="hours"] .unit-value')).toHaveText('12');

      const seconds = page.locator('[data-unit="seconds"] .unit-value');
      await expect(seconds).toHaveText('00');
      await page.clock.setFixedTime(NOW.getTime() + 3000);
      await expect(seconds).toHaveText('57');
    });

    test('lists events soonest first', async ({ page }) => {
      await expect(page.locator('.event-name')).toHaveText([
        'Halloween',
        'Thanksgiving',
        'Christmas',
        "New Year's Day",
        "Valentine's Day",
      ]);
      await expect(page.locator('.event-days').first()).toHaveText('21 days');
    });

    test('selecting an event updates the countdown and theme', async ({ page }) => {
      const thanksgiving = page.getByRole('button', { name: /Thanksgiving/ });
      await thanksgiving.click();
      await expect(thanksgiving).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thanksgiving');
      await expect(page.locator('.hero-date')).toHaveText('Thursday, November 26, 2026');
      await expect(page.locator('.app')).toHaveAttribute('data-theme', 'thanksgiving');
    });

    test('validates, adds, persists and removes a custom countdown', async ({ page }) => {
      const submit = page.getByRole('button', { name: 'Add countdown' });
      await submit.click();
      await expect(page.getByRole('alert')).toHaveText('Give your countdown a name.');

      await page.getByLabel('Name').fill('Launch day');
      await submit.click();
      await expect(page.getByRole('alert')).toHaveText('Pick a date.');

      await page.getByLabel('Date').fill('2026-10-20');
      await submit.click();
      await expect(page.getByRole('alert')).toHaveCount(0);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Launch day');
      await expect(page.locator('.event-name').first()).toHaveText('Launch day');
      await expect(page.getByLabel('Name')).toHaveValue('');

      await page.reload();
      await expect(page.locator('.event-name').first()).toHaveText('Launch day');

      await page.getByRole('button', { name: 'Remove Launch day' }).click();
      await expect(page.locator('.event-name')).toHaveCount(5);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Halloween');
    });
  });
}
