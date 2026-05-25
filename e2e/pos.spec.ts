import { test, expect } from '@playwright/test'

test.describe('POS module (unauthenticated)', () => {
  test('POS page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/pos')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Sales module (unauthenticated)', () => {
  test('sales list redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/sales')
    await expect(page).toHaveURL(/\/login/)
  })

  test('sale detail redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/sales/some-id')
    await expect(page).toHaveURL(/\/login/)
  })
})
