import { useAccount } from './account'
import * as clientModule from '@/lib/supabaseClient'

function makeAuthMock() {
  const listeners: Array<(event: string, session: unknown) => void> = []
  return {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn((cb: (event: string, session: unknown) => void) => {
      listeners.push(cb)
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    }),
    exchangeCodeForSession: vi.fn(),
    __emit: (event: string, session: unknown) => listeners.forEach(l => l(event, session)),
  }
}

describe('useAccount', () => {
  let auth: ReturnType<typeof makeAuthMock>

  beforeEach(() => {
    setActivePinia(createPinia())
    auth = makeAuthMock()
    vi.spyOn(clientModule, 'getSupabaseClient').mockResolvedValue({ auth } as never)
  })

  it('starts signed-out', () => {
    const account = useAccount()
    expect(account.user.value).toBeNull()
    expect(account.status.value).toBe('idle')
  })

  it('restores an existing session on init', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1', email: 'a@b.co' } } },
    })
    const account = useAccount()
    await account.init()
    expect(account.user.value).toEqual({ id: 'u1', email: 'a@b.co' })
  })

  it('sends a magic link with a hash-safe redirect', async () => {
    const account = useAccount()
    await account.init()
    await account.signInWithEmail('a@b.co')
    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'a@b.co',
      options: expect.objectContaining({ emailRedirectTo: expect.any(String) }),
    })
    expect(account.status.value).toBe('link-sent')
  })

  it('updates user on auth state change', async () => {
    const account = useAccount()
    await account.init()
    auth.__emit('SIGNED_IN', { user: { id: 'u2', email: 'c@d.co' } })
    expect(account.user.value).toEqual({ id: 'u2', email: 'c@d.co' })
    auth.__emit('SIGNED_OUT', null)
    expect(account.user.value).toBeNull()
  })

  it('clears user on signOut', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1', email: 'a@b.co' } } } })
    const account = useAccount()
    await account.init()
    await account.signOut()
    expect(auth.signOut).toHaveBeenCalled()
    expect(account.user.value).toBeNull()
  })
})
