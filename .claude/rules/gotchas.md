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

## Base UI Menu — `Menu.GroupLabel` / `Menu.Separator` require `Menu.Group`
Putting `DropdownMenuLabel` or `DropdownMenuSeparator` directly under `DropdownMenuContent` throws **"MenuGroupContext is missing. Menu group parts must be used within `<Menu.Group>` or `<Menu.RadioGroup>`"** at open time. The error bubbles up through the nearest `error.tsx`, which is how a buggy filter dropdown surfaced as "Failed to load settings" once.
Wrap label + separator + items in a `DropdownMenuGroup`:
```tsx
<DropdownMenuContent>
  <DropdownMenuGroup>
    <DropdownMenuLabel>…</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuCheckboxItem … />
  </DropdownMenuGroup>
</DropdownMenuContent>
```

## Server Actions that call `redirect()` from a client `onClick`
A bare `onClick={() => logoutAction()}` (where `logoutAction` calls `redirect('/login')`) throws an uncaught `NEXT_REDIRECT` client-side — Next.js only unwinds the redirect cleanly when the action is invoked through a `<form action={…}>` submission **or** wrapped in `startTransition`. For menu items that can't be form-wrapped (Base UI Menu items must be direct children of the Popup — wrapping in `<form>` triggers the gotcha above), use:
```tsx
const [, startTransition] = useTransition()
onClick={() => startTransition(() => logoutAction())}
```

## Hydration-safe timestamps
`new Date(iso).toLocaleString()` runs on the server in the server's timezone and produces a different string than the browser — every locale-rendered timestamp is a hydration mismatch. Two patterns:
- For tables (no need for user-locale display): slice the ISO string deterministically — `iso.slice(0, 16).replace('T', ' ')`.
- For user-facing dates that should show local time: use `components/shared/local-time.tsx`. It renders the ISO slice on the server and upgrades to `toLocaleString()` after mount via `useEffect`, with `suppressHydrationWarning` on the wrapper.

## Audit-log diffs — trigger captures `{ field: { old, new } }` for UPDATEs
The `audit_row_change` trigger function records UPDATE changes as `{ field: { old: <prev>, new: <next> } }` (INSERT / DELETE still capture a flat row snapshot). The UI in `components/settings/audit-log-details.tsx` has an `isDiff` guard that renders these as red-strikethrough → green diff cells; flat values still render via `pretty()`. If you add a new audited table, just add it to the trigger list — the diff shape comes for free.

## Demo login mode
`DEMO_USER_EMAIL` + `DEMO_USER_PASSWORD` env vars enable a Demo Mode tab on `/login` that signs the visitor in as the shared demo account. The real-credentials flow is unaffected. The toggle is rendered by `components/auth/login-form.tsx` and is hidden when either env var is absent — so production prod-prod deployments can drop the vars and the affordance disappears.

## Logo upload + storage cleanup
`uploadLogo()` writes to the `pharmacy-logos` Supabase Storage bucket under `<pharmacyId>/logo.<ext>` (admin client, public bucket, created on first use). `removeLogo()` lists every object under `<pharmacyId>/` and deletes them before nulling `pharmacies.logo_url` — needed because users can re-upload with different extensions and the old object would otherwise leak.
