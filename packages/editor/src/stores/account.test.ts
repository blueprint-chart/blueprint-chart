import { useAccount, useAccountStore } from './account'
import { useCloudChartsStore } from './cloudCharts'
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

  it('purges synced charts BEFORE the auth sign-out, so the dashboard refresh sees them gone', async () => {
    // The dashboard refreshes when showCloud flips (user → null), which happens
    // via onAuthStateChange DURING client.auth.signOut(). If the purge ran after
    // that, refresh() would read the still-present synced charts and show a stale
    // list. So the purge must complete before auth.signOut() is awaited.
    const order: string[] = []
    auth.signOut.mockImplementation(async () => {
      order.push('auth.signOut')
      return { error: null }
    })
    const cloud = useCloudChartsStore()
    vi.spyOn(cloud, 'clearLocalSynced').mockImplementation(() => {
      order.push('purge')
    })

    const account = useAccount()
    await account.init()
    await account.signOut()

    expect(order).toEqual(['purge', 'auth.signOut'])
  })

  it('removes synced charts from local storage on signOut, keeping local-only ones', async () => {
    localStorage.clear()
    // A synced chart: has a local DSL entry AND is tracked in the cloud index.
    localStorage.setItem('blueprint-chart:syncedaaaaa', 'chart bar {}')
    localStorage.setItem('blueprint-chart:cloud-index', JSON.stringify(['syncedaaaaa']))
    // A local-only chart: local DSL entry, NOT in the cloud index.
    localStorage.setItem('blueprint-chart:localbbbbbb', 'chart bar {}')

    auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1', email: 'a@b.co' } } } })
    const account = useAccount()
    await account.init()
    await account.signOut()

    expect(localStorage.getItem('blueprint-chart:syncedaaaaa')).toBeNull()
    expect(localStorage.getItem('blueprint-chart:localbbbbbb')).toBe('chart bar {}')
    expect(localStorage.getItem('blueprint-chart:cloud-index')).toBe('[]')
    localStorage.clear()
  })

  it('a second init() awaits the first session restore (no early-return race)', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1', email: 'a@b.co' } } } })
    const account = useAccount()
    void account.init() // first caller, in-flight
    await account.init() // second caller must await the SAME resolution
    expect(account.user.value).toEqual({ id: 'u1', email: 'a@b.co' })
    expect(auth.getSession).toHaveBeenCalledTimes(1)
  })
})

describe('account store — sign-in modal state', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with the sign-in modal closed', () => {
    const store = useAccountStore()
    expect(store.signInModalOpen).toBe(false)
  })

  it('openSignInModal() opens the sign-in modal', () => {
    const store = useAccountStore()
    store.openSignInModal()
    expect(store.signInModalOpen).toBe(true)
  })
})
