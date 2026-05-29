import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const demoAvailable = Boolean(process.env.DEMO_USER_EMAIL && process.env.DEMO_USER_PASSWORD)

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            {demoAvailable
              ? 'Use real credentials, or switch to Demo mode to explore the app instantly.'
              : 'Enter your credentials to access your pharmacy'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <LoginForm error={error} demoAvailable={demoAvailable} />
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Don&apos;t have an account?&nbsp;
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
