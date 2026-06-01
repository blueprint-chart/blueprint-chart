import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/config/runtimeConfig'

let clientPromise: Promise<SupabaseClient | null> | null = null

/**
 * Lazily create (and memoize) the Supabase client. Returns null when accounts
 * are disabled. The `@supabase/supabase-js` module is dynamically imported so
 * it is code-split out of the main bundle and never loaded in base64-only mode.
 */
export function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (clientPromise) {
    return clientPromise
  }
  clientPromise = (async () => {
    const config = getSupabaseConfig()
    if (!config) {
      return null
    }
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(config.url, config.anonKey, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        // We perform the ?code= exchange manually during boot (hash-router friendly).
        detectSessionInUrl: false,
        storageKey: 'blueprint-chart-auth',
      },
    })
  })()
  return clientPromise
}

/** Test-only: drop the memoized client. */
export function __resetClientForTests(): void {
  clientPromise = null
}
