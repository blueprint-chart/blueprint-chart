import {
  resolveSupabaseConfig,
  getSupabaseConfig,
  accountsEnabled,
  __resetConfigForTests,
} from './runtimeConfig'

describe('runtimeConfig', () => {
  beforeEach(() => {
    __resetConfigForTests()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    delete (window as Window).__BC_CONFIG__
  })

  it('returns null when nothing is configured', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    const config = await resolveSupabaseConfig({ url: undefined, anonKey: undefined })
    expect(config).toBeNull()
    expect(accountsEnabled()).toBe(false)
  })

  it('uses build-time env when no runtime override exists', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    const config = await resolveSupabaseConfig({ url: 'https://env.supabase.co', anonKey: 'env-key' })
    expect(config).toEqual({ url: 'https://env.supabase.co', anonKey: 'env-key' })
    expect(accountsEnabled()).toBe(true)
    expect(getSupabaseConfig()).toEqual({ url: 'https://env.supabase.co', anonKey: 'env-key' })
  })

  it('lets config.json override env', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ supabaseUrl: 'https://json.supabase.co', supabaseAnonKey: 'json-key' }),
    }))
    const config = await resolveSupabaseConfig({ url: 'https://env.supabase.co', anonKey: 'env-key' })
    expect(config).toEqual({ url: 'https://json.supabase.co', anonKey: 'json-key' })
  })

  it('lets window.__BC_CONFIG__ override config.json', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ supabaseUrl: 'https://json.supabase.co', supabaseAnonKey: 'json-key' }),
    }))
    ;(window as Window).__BC_CONFIG__ = { supabaseUrl: 'https://inline.supabase.co', supabaseAnonKey: 'inline-key' }
    const config = await resolveSupabaseConfig({ url: undefined, anonKey: undefined })
    expect(config).toEqual({ url: 'https://inline.supabase.co', anonKey: 'inline-key' })
  })

  it('ignores a hanging or failing config.json fetch and falls back to env', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    const config = await resolveSupabaseConfig({ url: 'https://env.supabase.co', anonKey: 'env-key' })
    expect(config).toEqual({ url: 'https://env.supabase.co', anonKey: 'env-key' })
  })

  it('treats a partial config (url only) as disabled', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    const config = await resolveSupabaseConfig({ url: 'https://env.supabase.co', anonKey: undefined })
    expect(config).toBeNull()
    expect(accountsEnabled()).toBe(false)
  })
})
