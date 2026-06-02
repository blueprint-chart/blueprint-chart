import { useCloudCharts } from './cloudCharts'
import * as clientModule from '@/lib/supabaseClient'

/** Minimal chainable query-builder mock matching the calls the store makes. */
function makeClientMock() {
  const state: {
    rows: Record<string, unknown>[]
    lastInsert?: Record<string, unknown>
    // Result for an awaited update/insert/delete chain (e.g. publish's .select('id')).
    updateResult: { data: Record<string, unknown>[] | null, error: unknown }
  } = { rows: [], updateResult: { data: [{ id: 'x' }], error: null } }
  const builder: Record<string, unknown> = {}
  const chain = () => builder
  builder.select = vi.fn(() => builder)
  builder.order = vi.fn(() => Promise.resolve({ data: state.rows, error: null }))
  builder.eq = vi.fn(() => builder)
  builder.single = vi.fn(() => Promise.resolve({ data: state.rows[0] ?? null, error: state.rows[0] ? null : { code: 'PGRST116' } }))
  builder.insert = vi.fn((row: Record<string, unknown>) => {
    state.lastInsert = row
    return builder
  })
  builder.upsert = vi.fn(() => Promise.resolve({ error: null }))
  builder.update = vi.fn(() => builder)
  builder.delete = vi.fn(() => builder)
  // Make the builder thenable so an awaited mutating chain (update/insert/delete,
  // and publish's trailing .select('id')) resolves to updateResult. Terminal reads
  // use the explicit promises from .order()/.single() and are unaffected.
  builder.then = (resolve: (v: unknown) => void) => resolve(state.updateResult)
  const client = {
    __state: state,
    from: vi.fn(() => chain()),
  }
  return client
}

describe('useCloudCharts', () => {
  let client: ReturnType<typeof makeClientMock>

  beforeEach(() => {
    setActivePinia(createPinia())
    client = makeClientMock()
    vi.spyOn(clientModule, 'getSupabaseClient').mockResolvedValue(client as never)
  })

  it('lists cloud charts ordered by updated_at', async () => {
    client.__state.rows = [
      { id: 'aaaaaaaaaaa', title: 'One', chart_type: 'bar', published: false, updated_at: '2026-01-02' },
    ]
    const store = useCloudCharts()
    const list = await store.listCloud()
    expect(client.from).toHaveBeenCalledWith('charts')
    expect(list).toEqual([
      { id: 'aaaaaaaaaaa', title: 'One', chartType: 'bar', published: false, updatedAt: '2026-01-02' },
    ])
  })

  it('inserts a new chart with an 11-char id', async () => {
    const store = useCloudCharts()
    const id = await store.pushCloud({ dsl: 'chart bar {}', meta: {}, title: 'T', chartType: 'bar' })
    expect(id).toHaveLength(11)
    expect(client.__state.lastInsert).toMatchObject({ dsl: 'chart bar {}', title: 'T', chart_type: 'bar' })
    expect(client.__state.lastInsert?.id).toHaveLength(11)
  })

  it('updates an existing chart when an id is supplied', async () => {
    const store = useCloudCharts()
    const id = await store.pushCloud({ id: 'bbbbbbbbbbb', dsl: 'chart bar {}', meta: {}, title: 'T', chartType: 'bar' })
    expect(id).toBe('bbbbbbbbbbb')
    expect(client.from).toHaveBeenCalledWith('charts')
  })

  it('publish returns true when a row is updated', async () => {
    client.__state.updateResult = { data: [{ id: 'bbbbbbbbbbb' }], error: null }
    const store = useCloudCharts()
    const ok = await store.publish('bbbbbbbbbbb', true)
    expect(ok).toBe(true)
    expect(client.from).toHaveBeenCalledWith('charts')
  })

  it('publish returns false when no row matches (chart not in cloud / not owned)', async () => {
    client.__state.updateResult = { data: [], error: null }
    const store = useCloudCharts()
    const ok = await store.publish('missingmissi', true)
    expect(ok).toBe(false)
  })

  it('isPublished reflects the row flag, false when absent', async () => {
    const store = useCloudCharts()
    client.__state.rows = [{ published: true }]
    expect(await store.isPublished('bbbbbbbbbbb')).toBe(true)
    client.__state.rows = [{ published: false }]
    expect(await store.isPublished('bbbbbbbbbbb')).toBe(false)
    client.__state.rows = []
    expect(await store.isPublished('missingmissi')).toBe(false)
  })

  it('returns null DSL when a published chart is not found', async () => {
    const store = useCloudCharts()
    const dsl = await store.fetchPublished('missingmissi')
    expect(dsl).toBeNull()
  })

  it('returns the DSL of a published chart', async () => {
    client.__state.rows = [{ dsl: 'chart bar {}' }]
    const store = useCloudCharts()
    const dsl = await store.fetchPublished('ccccccccccc')
    expect(dsl).toBe('chart bar {}')
  })

  it('loadCloud returns { dsl, meta, owner } when a row exists', async () => {
    client.__state.rows = [{ dsl: 'chart bar {}', meta: {}, owner: 'u1' }]
    const store = useCloudCharts()
    const record = await store.loadCloud('ccccccccccc')
    expect(record).toEqual({ dsl: 'chart bar {}', meta: {}, owner: 'u1' })
  })

  it('syncCloud calls upsert with snake_case chart_type and returns the id on success', async () => {
    const store = useCloudCharts()
    const id = await store.syncCloud({
      id: 'ddddddddddd',
      dsl: 'chart bar {}',
      meta: {},
      title: 'T',
      chartType: 'bar-vertical',
    })
    expect(id).toBe('ddddddddddd')
    expect(client.from).toHaveBeenCalledWith('charts')
    // client.from() returns the builder chain; grab the upsert spy from it
    const chainedBuilder = (client.from as ReturnType<typeof vi.fn>).mock.results[0].value as Record<string, unknown>
    const upsertSpy = chainedBuilder.upsert as ReturnType<typeof vi.fn>
    const upsertCall = upsertSpy.mock.calls[0]
    expect(upsertCall[0]).toMatchObject({ id: 'ddddddddddd', chart_type: 'bar-vertical' })
    expect(upsertCall[1]).toEqual({ onConflict: 'id' })
  })

  it('syncCloud returns null when input has no id', async () => {
    const store = useCloudCharts()
    const id = await store.syncCloud({ dsl: 'chart bar {}', meta: {}, title: 'T', chartType: 'bar' })
    expect(id).toBeNull()
  })
})

describe('cloud index helpers', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('markCloudBacked + isCloudBacked round-trip via localStorage', () => {
    const store = useCloudCharts()
    store.markCloudBacked('abc')
    expect(store.isCloudBacked('abc')).toBe(true)
    expect(store.isCloudBacked('xyz')).toBe(false)
  })

  it('persists cloud index to blueprint-chart:cloud-index key', () => {
    const store = useCloudCharts()
    store.markCloudBacked('abc')
    const raw = localStorage.getItem('blueprint-chart:cloud-index')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed).toContain('abc')
  })

  it('multiple ids accumulate in the index', () => {
    const store = useCloudCharts()
    store.markCloudBacked('aaa')
    store.markCloudBacked('bbb')
    expect(store.isCloudBacked('aaa')).toBe(true)
    expect(store.isCloudBacked('bbb')).toBe(true)
    expect(store.isCloudBacked('ccc')).toBe(false)
  })

  it('unmarkCloudBacked removes an id from the index', () => {
    const store = useCloudCharts()
    store.markCloudBacked('aaa')
    store.markCloudBacked('bbb')
    store.unmarkCloudBacked('aaa')
    expect(store.isCloudBacked('aaa')).toBe(false)
    expect(store.isCloudBacked('bbb')).toBe(true)
  })

  it('clearLocalSynced deletes synced local charts and clears the index, keeping local-only', () => {
    const store = useCloudCharts()
    // Synced: local DSL + tracked in cloud index.
    localStorage.setItem('blueprint-chart:syncedaaaaa', 'chart bar {}')
    store.markCloudBacked('syncedaaaaa')
    // Local-only: local DSL, not in the index.
    localStorage.setItem('blueprint-chart:localbbbbbb', 'chart bar {}')

    store.clearLocalSynced()

    expect(localStorage.getItem('blueprint-chart:syncedaaaaa')).toBeNull()
    expect(localStorage.getItem('blueprint-chart:localbbbbbb')).toBe('chart bar {}')
    expect(store.isCloudBacked('syncedaaaaa')).toBe(false)
    expect(localStorage.getItem('blueprint-chart:cloud-index')).toBe('[]')
  })
})
