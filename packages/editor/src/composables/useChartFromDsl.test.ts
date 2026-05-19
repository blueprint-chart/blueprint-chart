import { parseDslSceneCount, renderDsl } from './useChartFromDsl'

const { mockRenderBpc } = vi.hoisted(() => ({ mockRenderBpc: vi.fn() }))

vi.mock('@blueprint-chart/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@blueprint-chart/lib')>()
  return {
    ...actual,
    renderBpc: mockRenderBpc,
  }
})

const MINIMAL_BPC = `chart bar-vertical {
  data {
    "A" = 10
    "B" = 20
  }
}`

const SCENE_BPC = `chart bar-vertical {
  data {
    "A" = 10
  }
  scene {
    type = line
  }
}`

describe('parseDslSceneCount', () => {
  it('returns 0 for empty string', () => {
    expect(parseDslSceneCount('')).toBe(0)
  })

  it('returns scene count from parsed BPC', () => {
    expect(parseDslSceneCount(SCENE_BPC)).toBe(1)
  })

  it('returns 0 when no scenes in BPC', () => {
    expect(parseDslSceneCount(MINIMAL_BPC)).toBe(0)
  })
})

describe('renderDsl', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    vi.clearAllMocks()
  })

  it('forwards to renderBpc with container, bpc, and options', () => {
    renderDsl(container, MINIMAL_BPC)
    expect(mockRenderBpc).toHaveBeenCalledWith(container, MINIMAL_BPC, undefined)
  })

  it('passes options through to renderBpc', () => {
    renderDsl(container, MINIMAL_BPC, { thumbnail: true, transition: true })
    expect(mockRenderBpc).toHaveBeenCalledWith(container, MINIMAL_BPC, { thumbnail: true, transition: true })
  })

  it('passes stripColors option through to renderBpc', () => {
    renderDsl(container, MINIMAL_BPC, { stripColors: true })
    expect(mockRenderBpc).toHaveBeenCalledWith(container, MINIMAL_BPC, { stripColors: true })
  })

  it('passes ignoreLayout option through to renderBpc', () => {
    renderDsl(container, MINIMAL_BPC, { ignoreLayout: true })
    expect(mockRenderBpc).toHaveBeenCalledWith(container, MINIMAL_BPC, { ignoreLayout: true })
  })

  it('passes sceneIndex option through to renderBpc', () => {
    renderDsl(container, SCENE_BPC, { sceneIndex: 0 })
    expect(mockRenderBpc).toHaveBeenCalledWith(container, SCENE_BPC, { sceneIndex: 0 })
  })

  it('passes padding option through to renderBpc', () => {
    renderDsl(container, MINIMAL_BPC, { padding: '12px' })
    expect(mockRenderBpc).toHaveBeenCalledWith(container, MINIMAL_BPC, { padding: '12px' })
  })

  it('calls renderBpc even for empty DSL', () => {
    renderDsl(container, '')
    expect(mockRenderBpc).toHaveBeenCalledWith(container, '', undefined)
  })
})
