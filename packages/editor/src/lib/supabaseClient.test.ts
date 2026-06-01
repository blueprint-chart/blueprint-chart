import { getSupabaseClient, __resetClientForTests } from './supabaseClient'
import * as runtimeConfig from '@/config/runtimeConfig'

const createClientMock = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

describe('getSupabaseClient', () => {
  beforeEach(() => {
    __resetClientForTests()
    createClientMock.mockReset()
    createClientMock.mockReturnValue({ id: 'fake-client' })
  })

  it('returns null when accounts are disabled', async () => {
    vi.spyOn(runtimeConfig, 'getSupabaseConfig').mockReturnValue(null)
    const client = await getSupabaseClient()
    expect(client).toBeNull()
    expect(createClientMock).not.toHaveBeenCalled()
  })

  it('creates a PKCE client when config is present', async () => {
    vi.spyOn(runtimeConfig, 'getSupabaseConfig').mockReturnValue({ url: 'https://x.supabase.co', anonKey: 'k' })
    const client = await getSupabaseClient()
    expect(client).toEqual({ id: 'fake-client' })
    expect(createClientMock).toHaveBeenCalledWith(
      'https://x.supabase.co',
      'k',
      expect.objectContaining({
        auth: expect.objectContaining({ flowType: 'pkce', persistSession: true, detectSessionInUrl: false }),
      }),
    )
  })

  it('memoizes the client across calls', async () => {
    vi.spyOn(runtimeConfig, 'getSupabaseConfig').mockReturnValue({ url: 'https://x.supabase.co', anonKey: 'k' })
    const a = await getSupabaseClient()
    const b = await getSupabaseClient()
    expect(a).toBe(b)
    expect(createClientMock).toHaveBeenCalledTimes(1)
  })
})
