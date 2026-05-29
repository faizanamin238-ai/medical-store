import { test, expect } from '@playwright/test'

test.describe('Auth pages', () => {
  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText(/sign in/i).first()).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /forgot/i })).toBeVisible()
  })

  test('signup page renders correctly', async ({ page }) => {
    await page.goto('/signup')
    await expect(page).toHaveURL(/\/signup/)
    await expect(page.getByText(/create your account/i)).toBeVisible()
    await expect(page.getByLabel(/full name/i)).toBeVisible()
    await expect(page.getByLabel(/pharmacy name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
  })

  test('reset-password page renders correctly', async ({ page }) => {
    await page.goto('/reset-password')
    await expect(page).toHaveURL(/\/reset-password/)
    await expect(page.getByText(/reset password/i).first()).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
  })

  test('login shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('notreal@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 10000 })
  })

  test('signup shows validation error for short password', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel(/full name/i).fill('Test User')
    await page.getByLabel(/pharmacy name/i).fill('Test Pharmacy')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('short')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByText(/8 characters/i)).toBeVisible({ timeout: 10000 })
  })

  test('login page links navigate correctly', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /sign up/i }).click()
    await expect(page).toHaveURL(/\/signup/)
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('real/demo toggle is visible when demo is configured', async ({ page }) => {
    test.skip(!process.env.DEMO_USER_EMAIL || !process.env.DEMO_USER_PASSWORD,
      'Demo env vars not set')
    await page.goto('/login')
    await expect(page.getByRole('tab', { name: /real login/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /demo mode/i })).toBeVisible()
  })

  test('switching to demo mode hides credential fields and shows demo button', async ({ page }) => {
    test.skip(!process.env.DEMO_USER_EMAIL || !process.env.DEMO_USER_PASSWORD,
      'Demo env vars not set')
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await page.getByRole('tab', { name: /demo mode/i }).click()
    await expect(page.getByLabel(/email/i)).not.toBeVisible()
    await expect(page.getByLabel(/password/i)).not.toBeVisible()
    await expect(page.getByRole('button', { name: /continue as demo user/i })).toBeVisible()
  })

  test('switching back to real mode restores credential fields', async ({ page }) => {
    test.skip(!process.env.DEMO_USER_EMAIL || !process.env.DEMO_USER_PASSWORD,
      'Demo env vars not set')
    await page.goto('/login')
    await page.getByRole('tab', { name: /demo mode/i }).click()
    await page.getByRole('tab', { name: /real login/i }).click()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('demo mode signs in and redirects to dashboard', async ({ page }) => {
    test.skip(!process.env.DEMO_USER_EMAIL || !process.env.DEMO_USER_PASSWORD,
      'Demo env vars not set')
    await page.goto('/login')
    await page.getByRole('tab', { name: /demo mode/i }).click()
    await page.getByRole('button', { name: /continue as demo user/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
  })
})
