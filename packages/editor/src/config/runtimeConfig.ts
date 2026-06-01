export interface SupabaseConfig {
  url: string
  anonKey: string
}

interface EnvConfig {
  url: string | undefined
  anonKey: string | undefined
}

/** Where config.json is fetched from, relative to the deployed base path. */
const CONFIG_JSON_PATH = `${import.meta.env.BASE_URL ?? '/'}config.json`.replace(/\/{2,}/g, '/')

/** Abort the config.json fetch after this many ms so a hanging file never blocks boot. */
const CONFIG_FETCH_TIMEOUT_MS = 2000

let resolved: SupabaseConfig | null = null
let hasResolved = false

function normalize(url: unknown, anonKey: unknown): SupabaseConfig | null {
  if (typeof url === 'string' && url.length > 0 && typeof anonKey === 'string' && anonKey.length > 0) {
    return { url, anonKey }
  }
  return null
}

async function fetchConfigJson(): Promise<{ supabaseUrl?: unknown, supabaseAnonKey?: unknown } | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CONFIG_FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(CONFIG_JSON_PATH, { signal: controller.signal, cache: 'no-store' })
    if (!res.ok) {
      return null
    }
    return await res.json()
  }
  catch {
    return null
  }
  finally {
    clearTimeout(timer)
  }
}

/**
 * Resolve the effective Supabase config. Precedence (lowest -> highest):
 * build-time env -> runtime config.json -> window.__BC_CONFIG__.
 * Returns null (feature disabled) unless BOTH url and anonKey end up present.
 *
 * `env` is injected for testability; production callers pass the import.meta.env values.
 */
export async function resolveSupabaseConfig(
  env: EnvConfig = { url: import.meta.env.VITE_SUPABASE_URL, anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY },
): Promise<SupabaseConfig | null> {
  let url: unknown = env.url
  let anonKey: unknown = env.anonKey

  const json = await fetchConfigJson()
  if (json) {
    if (json.supabaseUrl !== undefined) {
      url = json.supabaseUrl
    }
    if (json.supabaseAnonKey !== undefined) {
      anonKey = json.supabaseAnonKey
    }
  }

  const inline = window.__BC_CONFIG__
  if (inline) {
    if (inline.supabaseUrl !== undefined) {
      url = inline.supabaseUrl
    }
    if (inline.supabaseAnonKey !== undefined) {
      anonKey = inline.supabaseAnonKey
    }
  }

  resolved = normalize(url, anonKey)
  hasResolved = true
  return resolved
}

/** Synchronous accessor for the already-resolved config. Null until resolveSupabaseConfig() runs. */
export function getSupabaseConfig(): SupabaseConfig | null {
  return resolved
}

/** True when a complete Supabase config has been resolved. */
export function accountsEnabled(): boolean {
  return hasResolved && resolved !== null
}

/** Test-only: clear cached resolution between cases. */
export function __resetConfigForTests(): void {
  resolved = null
  hasResolved = false
}
