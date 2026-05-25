import { test, expect } from '@playwright/test'

test.describe('Purchases module (unauthenticated)', () => {
  test('purchases list redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/purchases')
    await expect(page).toHaveURL(/\/login/)
  })

  test('new purchase page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/purchases/new')
    await expect(page).toHaveURL(/\/login/)
  })

  test('purchase detail page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/purchases/some-id')
    await expect(page).toHaveURL(/\/login/)
  })
})
