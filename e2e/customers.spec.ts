import { test, expect } from '@playwright/test'

test.describe('Customers module (unauthenticated)', () => {
  test('customers list redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/customers')
    await expect(page).toHaveURL(/\/login/)
  })

  test('new customer page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/customers/new')
    await expect(page).toHaveURL(/\/login/)
  })

  test('customer detail redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/customers/some-id')
    await expect(page).toHaveURL(/\/login/)
  })

  test('prescriptions page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/prescriptions')
    await expect(page).toHaveURL(/\/login/)
  })

  test('new prescription page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/prescriptions/new')
    await expect(page).toHaveURL(/\/login/)
  })
})
