import { useCloudSync, type CloudSyncDeps } from './useCloudSync'

describe('useCloudSync', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function deps(overrides: Partial<CloudSyncDeps> = {}): CloudSyncDeps {
    return {
      isSignedIn: () => true,
      isCloudChart: () => true,
      pushCloud: vi.fn().mockResolvedValue('id123456789'),
      snapshot: () => ({ id: 'id123456789', dsl: 'chart bar {}', meta: {}, title: 'T', chartType: 'bar' }),
      ...overrides,
    }
  }

  it('does not push when signed out', () => {
    const d = deps({ isSignedIn: () => false })
    const sync = useCloudSync(d)
    sync.requestSync()
    vi.advanceTimersByTime(2000)
    expect(d.pushCloud).not.toHaveBeenCalled()
  })

  it('does not push when the active chart is not a cloud chart', () => {
    const d = deps({ isCloudChart: () => false })
    const sync = useCloudSync(d)
    sync.requestSync()
    vi.advanceTimersByTime(2000)
    expect(d.pushCloud).not.toHaveBeenCalled()
  })

  it('debounces and pushes once after the quiet period', async () => {
    const d = deps()
    const sync = useCloudSync(d)
    sync.requestSync()
    sync.requestSync()
    sync.requestSync()
    expect(d.pushCloud).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1500)
    await Promise.resolve()
    expect(d.pushCloud).toHaveBeenCalledTimes(1)
    expect(d.pushCloud).toHaveBeenCalledWith({
      id: 'id123456789', dsl: 'chart bar {}', meta: {}, title: 'T', chartType: 'bar',
    })
  })

  it('exposes saving -> saved status transitions', async () => {
    const d = deps()
    const sync = useCloudSync(d)
    sync.requestSync()
    vi.advanceTimersByTime(1500)
    expect(sync.status.value).toBe('saving')
    await Promise.resolve()
    await Promise.resolve()
    expect(sync.status.value).toBe('saved')
  })

  it('sets offline status when the push fails', async () => {
    const d = deps({ pushCloud: vi.fn().mockResolvedValue(null) })
    const sync = useCloudSync(d)
    sync.requestSync()
    vi.advanceTimersByTime(1500)
    await Promise.resolve()
    await Promise.resolve()
    expect(sync.status.value).toBe('offline')
  })
})
