import { useCloudCharts } from './cloudCharts'
import * as clientModule from '@/lib/supabaseClient'

/** Minimal chainable query-builder mock matching the calls the store makes. */
function makeClientMock() {
  const state: { rows: Record<string, unknown>[], lastInsert?: Record<string, unknown> } = { rows: [] }
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

  it('toggles published', async () => {
    const store = useCloudCharts()
    await store.publish('bbbbbbbbbbb', true)
    expect(client.from).toHaveBeenCalledWith('charts')
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
})
