import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { AnnotationKind } from '@blueprint-chart/lib'
import EditorAnnotateTab from './EditorAnnotateTab.vue'

// jsdom doesn't have ResizeObserver; stub it globally
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Stubs
vi.mock('./EditorAnnotations.vue', () => ({
  default: {
    name: 'EditorAnnotations',
    template: '<div class="stub-editor-annotations" :data-show-repeat="String(showRepeat)" :data-model-length="String(modelValue?.length ?? 0)" />',
    props: ['modelValue', 'labels', 'chartType', 'chartWidth', 'chartHeight', 'showRepeat'],
    emits: ['update:modelValue'],
    expose: ['openIndex'],
    setup() {
      return { openIndex: ref<number | null>(null) }
    },
  },
}))

vi.mock('./EditorHighlightSection.vue', () => ({
  default: {
    name: 'EditorHighlightSection',
    template: '<div class="stub-highlight-section" />',
  },
}))

vi.mock('./EditorAreaFills.vue', () => ({
  default: {
    name: 'EditorAreaFills',
    template: '<div class="stub-area-fills" />',
    props: ['modelValue', 'seriesNames', 'seriesOverrides', 'globalInterpolation'],
    emits: ['update:modelValue'],
  },
}))

vi.mock('./EditorOverlays.vue', () => ({
  default: {
    name: 'EditorOverlays',
    template: '<div class="stub-overlays" :data-columns="columns.join(\'|\')" :data-show-repeat="String(showRepeat)" :data-model-length="String(modelValue?.length ?? 0)" />',
    props: ['modelValue', 'columns', 'targetsSeries', 'barColumn', 'showRepeat', 'reserved', 'legendHidden'],
    emits: ['update:modelValue'],
  },
}))

vi.mock('@/stores/previewContainer', () => ({
  usePreviewContainer: () => ({
    containerRef: ref(null),
  }),
}))

vi.mock('@/composables/useAnnotationDrag', () => ({
  useAnnotationDrag: () => {},
}))

// Store state shared across tests — reset in beforeEach
const baseAnnotationsRef = ref<object[]>([])
const baseOverlaysRef = ref<object[]>([])
const scenesRef = ref<object[]>([])
const activeIndexRef = ref(-1)
const chartTypeRef = ref('line')
const dataRef = ref('')

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({
    chartType: chartTypeRef,
    data: dataRef,
    areaFills: ref([]),
    overlays: ref([]),
    seriesOverrides: ref([]),
    selectedColumn: ref('Target'),
    _base: {
      annotations: baseAnnotationsRef,
      overlays: baseOverlaysRef,
    },
  }),
}))

const setOptionSpy = vi.fn()
const currentOptionsRef = ref<Record<string, unknown>>({ interpolation: 'linear' })
const baseOptionsRef = ref<Record<string, unknown>>({ interpolation: 'linear' })

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({
    currentOptions: currentOptionsRef,
    baseOptions: baseOptionsRef,
    setOption: setOptionSpy,
  }),
}))

vi.mock('@/stores/editorPanel', () => ({
  useEditorPanel: () => ({
    pendingAnnotationIndex: ref(null),
  }),
}))

vi.mock('@/stores/scenes', () => ({
  useScenes: () => ({
    scenes: scenesRef,
    activeIndex: activeIndexRef,
    activeScene: computed(() => {
      const idx = activeIndexRef.value
      return idx >= 0 && idx < scenesRef.value.length ? scenesRef.value[idx] : null
    }),
    update: vi.fn(),
  }),
}))

describe('EditorAnnotateTab', () => {
  beforeEach(() => {
    baseAnnotationsRef.value = []
    baseOverlaysRef.value = []
    scenesRef.value = []
    activeIndexRef.value = -1
    chartTypeRef.value = 'line'
    dataRef.value = ''
    currentOptionsRef.value = { interpolation: 'linear' }
    baseOptionsRef.value = { interpolation: 'linear' }
  })

  it('reads the base legend for base overlays and the scene legend for scene overlays', async () => {
    chartTypeRef.value = 'bar-vertical'
    scenesRef.value = [{ id: 'scene1', name: null }]
    activeIndexRef.value = 0
    currentOptionsRef.value = { legend: false }
    const w = mount(EditorAnnotateTab)
    await nextTick()
    const groups = w.findAllComponents({ name: 'EditorOverlays' })
    expect(groups.map(g => g.props('legendHidden'))).toEqual([false, true])
  })

  it('shows the Overlays section on a vertical bar chart', async () => {
    chartTypeRef.value = 'bar-vertical'
    const w = mount(EditorAnnotateTab)
    await nextTick()
    expect(w.find('.stub-overlays').exists()).toBe(true)
    expect(w.text()).toContain('Overlays')
  })

  it.each(['bar-vertical', 'bar-horizontal', 'bar-multi', 'bar-grouped', 'bar-split', 'bar-stacked', 'column-stacked'])('shows the Overlays section on %s', async (type) => {
    chartTypeRef.value = type
    const w = mount(EditorAnnotateTab)
    await nextTick()
    expect(w.find('.stub-overlays').exists()).toBe(true)
  })

  it.each([['bar-multi', true], ['bar-split', true], ['bar-stacked', false], ['bar-vertical', false]])('passes targetsSeries for %s', async (type, expected) => {
    chartTypeRef.value = type
    const w = mount(EditorAnnotateTab)
    await nextTick()
    const stub = w.findComponent({ name: 'EditorOverlays' })
    expect(stub.props('targetsSeries')).toBe(expected)
  })

  it.each([['bar-vertical', 'Target'], ['bar-stacked', undefined], ['bar-multi', undefined]])('passes the selected column as the bar on %s', async (type, expected) => {
    chartTypeRef.value = type
    const w = mount(EditorAnnotateTab)
    await nextTick()
    const stub = w.findComponent({ name: 'EditorOverlays' })
    expect(stub.props('barColumn')).toBe(expected)
  })

  it('renders base + this-scene overlay groups with repeat when a scene is active', async () => {
    chartTypeRef.value = 'bar-vertical'
    baseOverlaysRef.value = [{ columns: ['Target'] }]
    scenesRef.value = [{ id: 'scene1', name: null, overlays: [{ columns: ['Sales'] }, { columns: ['Budget'] }] }]
    activeIndexRef.value = 0
    const w = mount(EditorAnnotateTab)
    await nextTick()
    const groups = w.findAll('.stub-overlays')
    expect(groups.map(g => g.attributes('data-model-length'))).toEqual(['1', '2'])
    expect(groups.map(g => g.attributes('data-show-repeat'))).toEqual(['true', 'true'])
  })

  it('reserves the columns each overlay group shares with the other', async () => {
    chartTypeRef.value = 'bar-vertical'
    baseOverlaysRef.value = [{ columns: ['Target'], repeat: 'always' }, { columns: ['Gone'] }]
    scenesRef.value = [{ id: 'scene1', name: null, overlays: [{ columns: ['Sales'] }] }]
    activeIndexRef.value = 0
    const w = mount(EditorAnnotateTab)
    await nextTick()
    const groups = w.findAllComponents({ name: 'EditorOverlays' })
    expect(groups.map(g => g.props('reserved'))).toEqual([['Sales'], ['Target']])
  })

  it('renders one overlay group without repeat when there are no scenes', async () => {
    chartTypeRef.value = 'bar-vertical'
    baseOverlaysRef.value = [{ columns: ['Target'] }]
    const w = mount(EditorAnnotateTab)
    await nextTick()
    const groups = w.findAll('.stub-overlays')
    expect(groups.map(g => g.attributes('data-show-repeat'))).toEqual(['false'])
    expect(groups[0].attributes('data-model-length')).toBe('1')
  })

  it('hides the Overlays section on a line chart', async () => {
    chartTypeRef.value = 'line'
    const w = mount(EditorAnnotateTab)
    await nextTick()
    expect(w.find('.stub-overlays').exists()).toBe(false)
  })

  it('lists only numeric columns', async () => {
    chartTypeRef.value = 'bar-vertical'
    dataRef.value = [
      'series = "Sales","Region","Target"',
      '"Q1" = 10, "North", 12',
      '"Q2" = 20, "South", 18',
    ].join('\n')
    const w = mount(EditorAnnotateTab)
    await nextTick()
    expect(w.find('.stub-overlays').attributes('data-columns')).toBe('Sales|Target')
  })

  it('offers the highlight section on a scatter chart', async () => {
    chartTypeRef.value = 'scatter'
    const w = mount(EditorAnnotateTab)
    await nextTick()
    expect(w.find('.stub-highlight-section').exists()).toBe(true)
  })

  it('offers the highlight section on a dot plot', async () => {
    chartTypeRef.value = 'dot-plot'
    const w = mount(EditorAnnotateTab)
    await nextTick()
    expect(w.find('.stub-highlight-section').exists()).toBe(true)
  })

  it('renders one EditorAnnotations group when no scene is active', async () => {
    baseAnnotationsRef.value = [
      { kind: AnnotationKind.Point, target: 'a', text: 'Base annotation' },
    ]

    const w = mount(EditorAnnotateTab)
    await nextTick()

    const groups = w.findAll('.stub-editor-annotations')
    expect(groups).toHaveLength(1)
    expect(groups[0].attributes('data-show-repeat')).toBe('false')
    expect(groups[0].attributes('data-model-length')).toBe('1')
  })

  it('renders base + this-scene groups when a scene is active', async () => {
    baseAnnotationsRef.value = [
      { kind: AnnotationKind.Point, target: 'a', text: 'Base annotation' },
    ]
    scenesRef.value = [
      {
        id: 'scene1',
        name: null,
        annotations: [
          { kind: AnnotationKind.Point, target: 'b', text: 'Scene annotation' },
        ],
      },
    ]
    activeIndexRef.value = 0

    const w = mount(EditorAnnotateTab)
    await nextTick()

    const groups = w.findAll('.stub-editor-annotations')
    expect(groups).toHaveLength(2)

    // showRepeat = true when scenes.length > 0
    expect(groups[0].attributes('data-show-repeat')).toBe('true')
    expect(groups[1].attributes('data-show-repeat')).toBe('true')

    // First group bound to base (1 item)
    expect(groups[0].attributes('data-model-length')).toBe('1')
    // Second group bound to scene annotations (1 item)
    expect(groups[1].attributes('data-model-length')).toBe('1')
  })

  it('showRepeat is true when scenes exist even if none is active', async () => {
    scenesRef.value = [{ id: 'scene1', name: null }]
    // activeIndex remains -1

    const w = mount(EditorAnnotateTab)
    await nextTick()

    const groups = w.findAll('.stub-editor-annotations')
    // Only one group since no active scene
    expect(groups).toHaveLength(1)
    // showRepeat = true because scenes.length > 0
    expect(groups[0].attributes('data-show-repeat')).toBe('true')
  })
})
