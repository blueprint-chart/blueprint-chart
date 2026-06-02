import { useLocalImport, type LocalImportDeps } from './useLocalImport'

describe('useLocalImport', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  function seedLocal(id: string, dsl: string) {
    localStorage.setItem(`blueprint-chart:${id}`, dsl)
    localStorage.setItem(`blueprint-chart:${id}:meta`, JSON.stringify({ savedAt: '2026-01-01' }))
  }

  function deps(syncCloud = vi.fn().mockResolvedValue('localid0001')): LocalImportDeps {
    return {
      listLocalOnly: () => [
        { id: 'localid0001', title: 'Bar One', chartType: 'bar' },
        { id: 'localid0002', title: 'Line Two', chartType: 'line' },
      ],
      syncCloud,
      markCloudBacked: vi.fn(),
    }
  }

  it('counts local-only charts', () => {
    const importer = useLocalImport(deps())
    expect(importer.localOnlyCount()).toBe(2)
  })

  it('syncs each local-only chart by its existing id and keeps the local copy', async () => {
    seedLocal('localid0001', 'chart bar {}')
    seedLocal('localid0002', 'chart line {}')
    const sync = vi.fn(input => Promise.resolve(input.id))
    const d = deps(sync)
    const importer = useLocalImport(d)

    const synced = await importer.syncAll()

    expect(synced).toBe(2)
    expect(sync).toHaveBeenCalledTimes(2)
    // id is PRESERVED (upsert), not minted fresh.
    expect(sync.mock.calls[0][0]).toMatchObject({ id: 'localid0001', dsl: 'chart bar {}', title: 'Bar One', chartType: 'bar' })
    // local copy is NOT deleted.
    expect(localStorage.getItem('blueprint-chart:localid0001')).toBe('chart bar {}')
    // each synced id is marked cloud-backed.
    expect(d.markCloudBacked).toHaveBeenCalledWith('localid0001')
    expect(d.markCloudBacked).toHaveBeenCalledWith('localid0002')
  })

  it('does not mark cloud-backed when the sync fails', async () => {
    seedLocal('localid0001', 'chart bar {}')
    seedLocal('localid0002', 'chart line {}')
    const d = deps(vi.fn().mockResolvedValue(null))
    const importer = useLocalImport(d)

    const synced = await importer.syncAll()

    expect(synced).toBe(0)
    expect(d.markCloudBacked).not.toHaveBeenCalled()
  })

  it('skips local charts whose DSL is missing', async () => {
    seedLocal('localid0001', 'chart bar {}')
    const sync = vi.fn(input => Promise.resolve(input.id))
    const d = deps(sync)
    const importer = useLocalImport(d)

    const synced = await importer.syncAll()

    expect(synced).toBe(1)
    expect(sync).toHaveBeenCalledTimes(1)
    expect(sync.mock.calls[0][0]).toMatchObject({ id: 'localid0001' })
  })
})
