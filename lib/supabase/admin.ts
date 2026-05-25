import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Service-role client — server-side only, never call from client components.
// Used exclusively for admin operations like sending invite emails.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
