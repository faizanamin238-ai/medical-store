import { test, expect } from '@playwright/test'

/**
 * RLS tenant-isolation tests.
 * These tests verify that every protected route redirects unauthenticated
 * requests to /login. Full cross-tenant isolation is enforced by Postgres RLS
 * policies (pharmacy_id = get_user_pharmacy_id()) — verified at the DB layer.
 */

const PROTECTED_ROUTES = [
  '/dashboard',
  '/medicines',
  '/medicines/new',
  '/pos',
  '/sales',
  '/purchases',
  '/suppliers',
  '/customers',
  '/reports',
  '/team',
  '/settings',
]

test.describe('RLS — unauthenticated access blocked', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirects to /login`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/)
    })
  }
})

test.describe('RLS — auth callback and join flow', () => {
  test('/join redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/join')
    await expect(page).toHaveURL(/\/login/)
  })

  test('/auth/callback without code redirects gracefully', async ({ page }) => {
    await page.goto('/auth/callback')
    // should not 500 — ends up at login or dashboard
    const url = page.url()
    expect(url).toMatch(/\/(login|dashboard)/)
  })
})
