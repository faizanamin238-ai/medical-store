import { test, expect } from '@playwright/test'

test.describe('Reports module (unauthenticated)', () => {
  test('reports page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/reports')
    await expect(page).toHaveURL(/\/login/)
  })
})
