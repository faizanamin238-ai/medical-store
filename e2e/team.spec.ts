import { test, expect } from '@playwright/test'

test.describe('Team module (unauthenticated)', () => {
  test('team page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/team')
    await expect(page).toHaveURL(/\/login/)
  })

  test('join page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/join')
    await expect(page).toHaveURL(/\/login/)
  })
})
