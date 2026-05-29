import { test, expect } from '@playwright/test'

test.describe('Settings module (unauthenticated)', () => {
  test('settings page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/login/)
  })
})
