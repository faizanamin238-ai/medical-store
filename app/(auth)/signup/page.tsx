import Link from 'next/link'
import { signUpAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const { error, success } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Set up your pharmacy on MedStore</CardDescription>
        </CardHeader>

        <CardContent>
          {success === 'check_email' && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
              Account created! Check your email to confirm your address.
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={signUpAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" placeholder="Ahmed Khan" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pharmacyName">Pharmacy name</Label>
              <Input id="pharmacyName" name="pharmacyName" placeholder="Al-Shifa Pharmacy" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Min 8 characters" required />
            </div>

            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?&nbsp;
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
