import { test, expect } from '@playwright/test'

test.describe('Suppliers module (unauthenticated)', () => {
  test('suppliers list redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/suppliers')
    await expect(page).toHaveURL(/\/login/)
  })

  test('new supplier page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/suppliers/new')
    await expect(page).toHaveURL(/\/login/)
  })

  test('supplier edit page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/suppliers/some-id')
    await expect(page).toHaveURL(/\/login/)
  })
})
