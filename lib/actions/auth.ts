'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignUpSchema, LoginSchema, ResetPasswordSchema } from '@/lib/validators/auth'

export async function signUpAction(formData: FormData) {
  const raw = {
    fullName: formData.get('fullName') as string,
    pharmacyName: formData.get('pharmacyName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = SignUpSchema.safeParse(raw)
  if (!parsed.success) {
    const message = parsed.error.issues[0].message
    redirect(`/signup?error=${encodeURIComponent(message)}`)
  }

  const { fullName, pharmacyName, email, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, pharmacy_name: pharmacyName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/signup?success=check_email')
}

export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    const message = parsed.error.issues[0].message
    redirect(`/login?error=${encodeURIComponent(message)}`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/dashboard')
}

export async function demoLoginAction() {
  const demoEmail = process.env.DEMO_USER_EMAIL
  const demoPassword = process.env.DEMO_USER_PASSWORD

  if (!demoEmail || !demoPassword) {
    redirect(`/login?error=${encodeURIComponent('Demo mode is not configured on the server.')}`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(`Demo login failed: ${error.message}`)}`)
  }

  redirect('/dashboard')
}

export async function resetPasswordAction(formData: FormData) {
  const raw = { email: formData.get('email') as string }

  const parsed = ResetPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    const message = parsed.error.issues[0].message
    redirect(`/reset-password?error=${encodeURIComponent(message)}`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback?next=/reset-password/update`,
  })

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/reset-password?success=check_email')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
