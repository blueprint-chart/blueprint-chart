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

  function deps(pushCloud = vi.fn().mockResolvedValue('newcloudid01')): LocalImportDeps {
    return {
      listLocal: () => [
        { id: 'localid0001', title: 'Bar One', chartType: 'bar' },
        { id: 'localid0002', title: 'Line Two', chartType: 'line' },
      ],
      pushCloud,
    }
  }

  it('counts importable local charts', () => {
    seedLocal('localid0001', 'chart bar {}')
    const importer = useLocalImport(deps())
    expect(importer.localCount()).toBe(2)
  })

  it('imports each local chart with a fresh cloud id', async () => {
    seedLocal('localid0001', 'chart bar {}')
    seedLocal('localid0002', 'chart line {}')
    const push = vi.fn().mockResolvedValue('newcloudid01')
    const importer = useLocalImport(deps(push))
    const imported = await importer.importAll()
    expect(imported).toBe(2)
    expect(push).toHaveBeenCalledTimes(2)
    expect(push.mock.calls[0][0]).not.toHaveProperty('id')
    expect(push.mock.calls[0][0]).toMatchObject({ dsl: 'chart bar {}', title: 'Bar One', chartType: 'bar' })
  })

  it('skips local charts whose DSL is missing', async () => {
    seedLocal('localid0001', 'chart bar {}')
    const push = vi.fn().mockResolvedValue('newcloudid01')
    const importer = useLocalImport(deps(push))
    const imported = await importer.importAll()
    expect(imported).toBe(1)
    expect(push).toHaveBeenCalledTimes(1)
  })
})
