import { mount } from '@vue/test-utils'
import type { AnnotationConfig, SeriesOverride } from '@blueprint-chart/lib'
import { ChartType, SortDirection } from '@blueprint-chart/lib'
import { TransformType } from '@/enums'
import { resolveScene, resolveSortFromTransforms } from './useChartPreview'
import { useChartPreview } from './useChartPreview'
import { useChartConfig } from '@/stores/chartConfig'
import { useScenes } from '@/stores/scenes'
import type { SceneOverride } from './useScenes'
import type { TransformStep } from './useDataTransforms'

const { mockRenderChart } = vi.hoisted(() => ({ mockRenderChart: vi.fn() }))

vi.mock('@blueprint-chart/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@blueprint-chart/lib')>()
  return {
    ...actual,
    renderChart: mockRenderChart,
  }
})

vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core')
  return {
    ...actual,
    useResizeObserver: vi.fn(),
    useThrottleFn: (_fn: (...args: unknown[]) => unknown) => _fn,
  }
})

function scene(overrides: Partial<SceneOverride> = {}): SceneOverride {
  return { id: Math.random().toString(36).slice(2), name: null, ...overrides }
}

describe('resolveScene', () => {
  it('inherits colorizes from prior scene when current scene has none', () => {
    const scenes = [
      scene({ colorizes: [{ target: 'India', color: '#00d084' }] }),
      scene({}),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.colorizes).toEqual([{ target: 'India', color: '#00d084' }])
  })

  it('inherits colorizes from prior scene even when current scene has empty colorizes array', () => {
    const scenes = [
      scene({ colorizes: [{ target: 'India', color: '#00d084' }] }),
      scene({ colorizes: [] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.colorizes).toEqual([{ target: 'India', color: '#00d084' }])
  })

  it('later scene with non-empty colorizes replaces prior colorizes', () => {
    const scenes = [
      scene({ colorizes: [{ target: 'India', color: '#00d084' }] }),
      scene({ colorizes: [{ target: 'China', color: '#ff0000' }] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.colorizes).toEqual([{ target: 'China', color: '#ff0000' }])
  })

  it('inherits seriesOverrides from prior scene when current has empty array', () => {
    const earlyOverrides: SeriesOverride[] = [{ name: 'A', color: 'red' }]
    const scenes = [
      scene({ seriesOverrides: earlyOverrides }),
      scene({ seriesOverrides: [] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.seriesOverrides).toEqual(earlyOverrides)
  })

  it('returns null for negative index', () => {
    expect(resolveScene([scene()], -1)).toBeNull()
  })

  it('returns null for out-of-bounds index', () => {
    expect(resolveScene([scene()], 5)).toBeNull()
  })

  it('returns the scene itself when it is the only one', () => {
    const s = scene({ chartType: ChartType.Line })
    const result = resolveScene([s], 0)!
    expect(result.chartType).toBe(ChartType.Line)
  })

  it('inherits chartType from a prior scene', () => {
    const scenes = [
      scene({ chartType: ChartType.Line }),
      scene({ colorizes: [{ target: 'A', color: 'red' }] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.chartType).toBe(ChartType.Line)
    expect(result.colorizes).toEqual([{ target: 'A', color: 'red' }])
  })

  it('later scene overrides chartType from earlier scene', () => {
    const scenes = [
      scene({ chartType: ChartType.Line }),
      scene({ chartType: ChartType.BarVertical }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.chartType).toBe(ChartType.BarVertical)
  })

  it('deep-merges chartTypeOptions across scenes', () => {
    const scenes = [
      scene({ chartTypeOptions: { colors: ['red'], legend: true } }),
      scene({ chartTypeOptions: { legend: false } }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.chartTypeOptions).toEqual({ colors: ['red'], legend: false })
  })

  it('inherits data from prior scene', () => {
    const scenes = [
      scene({ data: 'A,1\nB,2' }),
      scene({ chartType: ChartType.Line }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.data).toBe('A,1\nB,2')
    expect(result.chartType).toBe(ChartType.Line)
  })

  it('data cascades through multiple scenes', () => {
    const scenes = [
      scene({ data: 'X,1\nY,2' }),
      scene({}),
      scene({}),
    ]
    const result = resolveScene(scenes, 2)!
    expect(result.data).toBe('X,1\nY,2')
  })

  it('later scene data overrides earlier scene data', () => {
    const scenes = [
      scene({ data: 'A,1' }),
      scene({ data: 'B,2' }),
      scene({}),
    ]
    const result = resolveScene(scenes, 2)!
    expect(result.data).toBe('B,2')
  })

  it('empty string data is a valid override (clears inherited data)', () => {
    const scenes = [
      scene({ data: 'A,1\nB,2' }),
      scene({ data: '' }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.data).toBe('')
  })

  it('inherits sort transform from prior scene', () => {
    const scenes = [
      scene({ transforms: [{ id: '0', type: TransformType.Sort, config: { columns: 'value', direction: SortDirection.Ascending } }] }),
      scene({}),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.transforms).toEqual([{ id: '0', type: TransformType.Sort, config: { columns: 'value', direction: SortDirection.Ascending } }])
  })

  it('does not inherit from scenes after the active index', () => {
    const scenes = [
      scene({ chartType: ChartType.Line }),
      scene({}),
      scene({ chartType: ChartType.Donut }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.chartType).toBe(ChartType.Line)
  })

  it('preserves id and name from the active scene', () => {
    const scenes = [
      scene({ name: 'First' }),
      scene({ name: 'Second' }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.name).toBe('Second')
    expect(result.id).toBe(scenes[1].id)
  })

  it('replaces (not merges) colorizes from later scene', () => {
    const scenes = [
      scene({ colorizes: [{ target: 'A', color: 'red' }] }),
      scene({ colorizes: [{ target: 'B', color: 'blue' }] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.colorizes).toEqual([{ target: 'B', color: 'blue' }])
  })

  it('scene annotations override base annotations', () => {
    const baseAnnotations: AnnotationConfig[] = [{ id: 'a1', kind: 'point', target: 'A', text: 'p' }]
    const sceneAnnotations: AnnotationConfig[] = [{ id: 'a2', kind: 'range', start: 0, end: 10 }]
    const scenes = [
      scene({ annotations: baseAnnotations }),
      scene({ annotations: sceneAnnotations }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.annotations).toEqual(sceneAnnotations)
  })

  it('resolved scene without annotations field returns undefined annotations', () => {
    const scenes = [
      scene({ chartType: ChartType.Line }),
    ]
    const result = resolveScene(scenes, 0)!
    expect(result.annotations).toBeUndefined()
  })

  it('deep-merges properties across scenes', () => {
    const scenes = [
      scene({ properties: { width: 100, color: 'red' } }),
      scene({ properties: { color: 'blue' } }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.properties).toEqual({ width: 100, color: 'blue' })
  })

  it('transforms from later scene replace earlier scene', () => {
    const earlyTransforms: TransformStep[] = [{ type: TransformType.Filter, column: 'A', value: '1' }]
    const lateTransforms: TransformStep[] = [{ type: TransformType.Sort, column: 'B', value: 'asc' }]
    const scenes = [
      scene({ transforms: earlyTransforms }),
      scene({ transforms: lateTransforms }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.transforms).toEqual(lateTransforms)
  })

  it('inherits a chart-type option from a prior scene, so the preview sees a folded sortMode', () => {
    const scenes = [
      scene({ chartTypeOptions: { sortMode: 'total' } }),
      scene({ chartTypeOptions: { legend: true } }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.chartTypeOptions).toEqual({ sortMode: 'total', legend: true })
  })

  it('empty annotations array in later scene does not override cascaded annotations', () => {
    const scenes = [
      scene({ annotations: [{ id: 'a1', kind: 'point', target: 'A', text: 'p' }] }),
      scene({ annotations: [] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.annotations).toEqual([{ id: 'a1', kind: 'point', target: 'A', text: 'p' }])
  })

  it('non-empty annotations in later scene do override earlier scene', () => {
    const scenes = [
      scene({ annotations: [{ id: 'a1', kind: 'point', target: 'A', text: 'p' }] }),
      scene({ annotations: [{ id: 'a2', kind: 'point', target: 'B', text: 'q' }] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.annotations).toEqual([{ id: 'a2', kind: 'point', target: 'B', text: 'q' }])
  })

  it('empty annotations in middle scene does not block cascading to later scene', () => {
    const scenes = [
      scene({ annotations: [{ id: 'a1', kind: 'point', target: 'A', text: 'p' }] }),
      scene({ annotations: [] }),
      scene({}),
    ]
    const result = resolveScene(scenes, 2)!
    expect(result.annotations).toEqual([{ id: 'a1', kind: 'point', target: 'A', text: 'p' }])
  })

  it('seriesOverrides from later scene replace earlier scene', () => {
    const earlyOverrides: SeriesOverride[] = [{ name: 'A', color: 'red' }]
    const lateOverrides: SeriesOverride[] = [{ name: 'B', color: 'blue' }]
    const scenes = [
      scene({ seriesOverrides: earlyOverrides }),
      scene({ seriesOverrides: lateOverrides }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.seriesOverrides).toEqual(lateOverrides)
  })
})

describe('resolveSortFromTransforms', () => {
  it('extracts sort direction from resolved transforms', () => {
    const resolved = scene({ transforms: [{ id: '0', type: TransformType.Sort, config: { columns: 'value', direction: SortDirection.Ascending } }] })
    expect(resolveSortFromTransforms(resolved)).toBe(SortDirection.Ascending)
  })

  it('returns undefined when no sort transform', () => {
    const resolved = scene({ transforms: [{ id: '0', type: TransformType.Filter, config: { column: 'A', value: '1' } }] })
    expect(resolveSortFromTransforms(resolved)).toBeUndefined()
  })

  it('returns undefined when no transforms', () => {
    expect(resolveSortFromTransforms(scene({}))).toBeUndefined()
  })

  it('returns undefined for null scene', () => {
    expect(resolveSortFromTransforms(null)).toBeUndefined()
  })

  it('uses last sort transform when multiple exist', () => {
    const resolved = scene({ transforms: [
      { id: '0', type: TransformType.Sort, config: { columns: 'value', direction: SortDirection.Ascending } },
      { id: '1', type: TransformType.Sort, config: { columns: 'value', direction: SortDirection.Descending } },
    ] })
    expect(resolveSortFromTransforms(resolved)).toBe(SortDirection.Descending)
  })

  it('resolves sort from inherited transforms in multi-scene scenario', () => {
    // Simulates: Scene 1 has sort transform, Scene 2 only has colorize
    const scenes = [
      scene({
        chartTypeOptions: { tooltips: true, crosshair: true },
        colorizes: [{ target: 'India', color: '#00d084', label: '' }],
        transforms: [{ id: '0', type: TransformType.Sort, config: { columns: 'value', direction: SortDirection.Ascending } }],
      }),
      scene({
        colorizes: [{ target: 'India', color: '#9900ef', label: '' }],
      }),
    ]

    const resolved = resolveScene(scenes, 1)!
    expect(resolved.transforms).toBeDefined()
    expect(resolveSortFromTransforms(resolved)).toBe(SortDirection.Ascending)
  })

  it('defaults to ascending when sort transform has no direction', () => {
    const resolved = scene({ transforms: [
      { id: '0', type: TransformType.Sort, config: { columns: 'value' } },
    ] })
    expect(resolveSortFromTransforms(resolved)).toBe(SortDirection.Ascending)
  })

  it('defaults to ascending for inherited sort transform without direction', () => {
    const scenes = [
      scene({
        transforms: [{ id: '0', type: TransformType.Sort, config: { columns: 'value' } }],
      }),
      scene({
        colorizes: [{ target: 'India', color: '#9900ef', label: '' }],
      }),
    ]

    const resolved = resolveScene(scenes, 1)!
    expect(resolveSortFromTransforms(resolved)).toBe(SortDirection.Ascending)
  })
})

describe('annotation filtering', () => {
  function filterAnnotations(
    annotations: { id?: string, kind: string }[],
    hiddenIds?: Set<string>,
  ): { id?: string, kind: string }[] {
    if (!hiddenIds) {
      return annotations
    }
    return annotations.filter(a => !a.id || !hiddenIds.has(a.id))
  }

  it('returns all annotations when hiddenIds is undefined', () => {
    const annotations = [
      { id: 'a', kind: 'point' },
      { id: 'b', kind: 'range' },
    ]
    expect(filterAnnotations(annotations, undefined)).toEqual(annotations)
  })

  it('filters out annotation with matching id', () => {
    const annotations = [
      { id: 'a', kind: 'point' },
      { id: 'b', kind: 'range' },
    ]
    const result = filterAnnotations(annotations, new Set(['a']))
    expect(result).toEqual([{ id: 'b', kind: 'range' }])
  })

  it('keeps annotation with no id even when hiddenIds is populated', () => {
    const annotations = [
      { kind: 'point' },
      { id: 'b', kind: 'range' },
    ]
    const result = filterAnnotations(annotations, new Set(['b']))
    expect(result).toEqual([{ kind: 'point' }])
  })

  it('keeps annotation with id not in hiddenIds', () => {
    const annotations = [
      { id: 'x', kind: 'point' },
    ]
    const result = filterAnnotations(annotations, new Set(['y']))
    expect(result).toEqual([{ id: 'x', kind: 'point' }])
  })

  it('filters multiple annotations with different ids', () => {
    const annotations = [
      { id: 'a', kind: 'point' },
      { id: 'b', kind: 'range' },
      { id: 'c', kind: 'free' },
    ]
    const result = filterAnnotations(annotations, new Set(['a', 'c']))
    expect(result).toEqual([{ id: 'b', kind: 'range' }])
  })

  it('empty hiddenIds set filters nothing', () => {
    const annotations = [
      { id: 'a', kind: 'point' },
      { id: 'b', kind: 'range' },
    ]
    const result = filterAnnotations(annotations, new Set())
    expect(result).toEqual(annotations)
  })
})

describe('base + scene annotation merging', () => {
  // Reproduces the real scenario: base annotation on "Japan", scene 0 adds
  // annotation on "India", scene 1 only has a colorize.
  // All scenes must show base annotations alongside scene annotations.

  function mergeAnnotations(
    baseAnnotations: AnnotationConfig[],
    sceneAnnotations: AnnotationConfig[],
  ): AnnotationConfig[] {
    return [...baseAnnotations, ...sceneAnnotations]
  }

  const baseAnns: AnnotationConfig[] = [
    { kind: 'point', id: '537sb', target: 'Japan', text: 'Base annotation', showLine: true, showArrow: true },
  ]

  const scene0Anns: AnnotationConfig[] = [
    { kind: 'point', id: 'tha5f', target: 'India', text: 'Scene annotation', showLine: true, showArrow: true },
  ]

  it('base annotation is present when no scene is active', () => {
    const result = mergeAnnotations(baseAnns, [])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('537sb')
  })

  it('base + scene annotations are both present in scene with own annotations', () => {
    const result = mergeAnnotations(baseAnns, scene0Anns)
    expect(result).toHaveLength(2)
    expect(result.map(a => a.id)).toEqual(['537sb', 'tha5f'])
  })

  it('base + cascaded scene annotations are present in later scene without annotations', () => {
    // Scene 1 inherits scene 0 annotations via resolveScene cascading
    const scenes = [
      scene({ annotations: scene0Anns }),
      scene({ colorizes: [{ target: 'China', color: '#9900ef' }] }),
    ]
    const resolved = resolveScene(scenes, 1)!
    const cascadedSceneAnns = resolved.annotations ?? []

    const result = mergeAnnotations(baseAnns, cascadedSceneAnns)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('537sb')
    expect(result[1].id).toBe('tha5f')
  })

  it('scene annotations do not duplicate base annotations', () => {
    // If a scene has no annotations of its own, only base should appear
    const scenes = [
      scene({ colorizes: [{ target: 'X', color: 'red' }] }),
    ]
    const resolved = resolveScene(scenes, 0)!
    const result = mergeAnnotations(baseAnns, resolved.annotations ?? [])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('537sb')
  })
})

describe('useChartPreview › renderChart annotations windowing', () => {
  // Minimal data string that parseData turns into non-empty labels
  const DATA = '"A" = 10\n"B" = 20'

  function mountPreview() {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const containerRef = ref<HTMLElement | null>(container)
    const Comp = defineComponent({
      setup() {
        useChartPreview(containerRef)
        return () => h('div')
      },
    })
    const wrapper = mount(Comp, { attachTo: document.body })
    return { wrapper, container }
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    mockRenderChart.mockClear()
    // Set up a minimal valid config so parseData produces non-empty labels
    const config = useChartConfig()
    config.reset()
    config._base.data.value = DATA
    config._base.chartType.value = ChartType.BarVertical
  })

  it('passes only repeat-visible annotations with anchor keys to renderChart', async () => {
    const config = useChartConfig()
    const scenesStore = useScenes()

    // Base: one annotation with repeat='always', one with default (undefined → only scene 0)
    const alwaysAnn: AnnotationConfig = { kind: 'point', target: 'A', text: 'always', repeat: 'always' }
    const defaultAnn: AnnotationConfig = { kind: 'point', target: 'B', text: 'default' }
    config._base.annotations.value = [alwaysAnn, defaultAnn]

    // Two scenes; activate index 1 so activeIndex > 0
    scenesStore.add()
    scenesStore.add()
    scenesStore.setActive(1)

    const { wrapper } = mountPreview()
    await nextTick()
    wrapper.unmount()

    expect(mockRenderChart).toHaveBeenCalled()
    const lastCall = mockRenderChart.mock.calls[mockRenderChart.mock.calls.length - 1]
    const annotations = lastCall[1].annotations as (AnnotationConfig & { key: string })[]

    // Only the 'always' annotation should be visible at index 1
    expect(annotations).toHaveLength(1)
    expect(annotations[0].key).toBe('base:0:point')
    expect(annotations[0].text).toBe('always')
  })
})
