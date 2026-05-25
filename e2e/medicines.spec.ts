import { test, expect } from '@playwright/test'

// These tests run as unauthenticated — they verify the redirect gate works.
// Full CRUD tests require a logged-in session (Phase 9 RLS testing).

test.describe('Medicines module (unauthenticated)', () => {
  test('medicines list redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/medicines')
    await expect(page).toHaveURL(/\/login/)
  })

  test('new medicine page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/medicines/new')
    await expect(page).toHaveURL(/\/login/)
  })

  test('medicine edit page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/medicines/some-id')
    await expect(page).toHaveURL(/\/login/)
  })
})
