# Known Gotchas & Patterns

Discovered during implementation — check here before reinventing solutions.

## @base-ui/react DialogTrigger
Does **not** support `asChild`. Apply button styles directly on the trigger element:
```tsx
import { buttonVariants } from '@/components/ui/button'
<DialogTrigger className={buttonVariants({ size: 'sm' })}>
  <Icon className="h-4 w-4" /> Label
</DialogTrigger>
```

## Zod v4 — `issues` not `errors`
`ZodError` in Zod v4 uses `.issues` not `.errors`:
```ts
// Wrong: parsed.error.errors[0].message
parsed.error.issues[0].message
```

## Zod v4 enum — no `required_error`
`z.enum([...])` does not accept `required_error` in Zod v4. Omit the options object:
```ts
// Wrong: z.enum(['a', 'b'], { required_error: 'Required' })
z.enum(['manager', 'pharmacist', 'cashier'])
```

## Supabase RPC type casting
When calling an RPC not yet in generated types, cast to bypass TypeScript:
```ts
const { data, error } = await (supabase.rpc as any)('rpc_name', { param: value })
```
Remove the cast after running `supabase gen types`.

## Admin / service-role client
`lib/supabase/admin.ts` holds `createAdminClient()` (service role). **Server-side only.**
Never import from client components. Use for `auth.admin.*` operations (e.g. `inviteUserByEmail`).

## SECURITY DEFINER RPCs for cross-profile queries
When a Server Action needs to read/mutate `profiles` across RLS boundaries (e.g. team management), write a `SECURITY DEFINER` RPC that enforces its own guards internally. Do not try to work around profiles RLS from the caller.

## Recharts Tooltip formatter — guard for undefined
`ValueType` can be `undefined`, so always guard:
```tsx
formatter={(value) => [
  typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2 }) : value,
  'Revenue',
]}
```

## CSV export — pure client-side
No server file generation needed:
```ts
const blob = new Blob([csvString], { type: 'text/csv' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url; a.download = filename; a.click()
URL.revokeObjectURL(url)
```

## Team invite flow
`inviteUserByEmail` (admin client) → email link → `/auth/callback?next=/join` → `/join` page → `accept_team_invite()` SECURITY DEFINER RPC. The RPC reads `auth.uid()` to look up the user's email and matches it against `pharmacy_invites`.

## Report data aggregation
Aggregate in TypeScript server-side rather than SQL RPCs when the data volume is manageable and no new migration is warranted. Fetch raw rows → reduce in a Map.
