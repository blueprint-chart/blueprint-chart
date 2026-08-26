import { samples, parseData, getChart, buildChartOptions, resolveBackgroundColor, ChartType } from '@blueprint-chart/lib'
import { renderDsl } from './composables/useChartFromDsl'
import { useDslSync } from './composables/useDslSync'
import { useChartConfig } from './composables/useChartConfig'
import { useChartTypeOptions } from './composables/useChartTypeOptions'
import { useScenes } from './composables/useScenes'
import { resolveVisibleAnnotations } from '@/utils/scenes'

function normalizeRandomIds(html: string): string {
  // The renderer generates per-call unique IDs like bc-clip-a1b2c3d4 and bc-arrow-HEX.
  // Replace them all with stable placeholders so two renders of the same chart compare equal.
  return html
    .replace(/bc-clip-[a-zA-Z0-9]+/g, 'bc-clip-TEST')
    .replace(/bc-arrow-[a-zA-Z0-9]+/g, 'bc-arrow-TEST')
}

function extractChartSvg(container: HTMLElement): string {
  const svg = container.querySelector('svg')
  if (!svg) {
    return ''
  }
  // The background rect is a frame concern (applyCanvasBackground only runs
  // inside a .bc-frame); frameless thumbnails never get one. Strip it so the
  // parity check compares chart bodies only.
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.querySelector('.bc-canvas-bg')?.remove()
  return normalizeRandomIds(clone.outerHTML)
}

function renderLiveEquivalent(container: HTMLElement, dsl: string): void {
  setActivePinia(createPinia())
  useChartConfig().reset()
  useChartTypeOptions().reset()
  useScenes().reset()

  const { applyDsl } = useDslSync()
  const result = applyDsl(dsl)
  expect(result.success).toBe(true)

  const config = useChartConfig()
  const { currentOptions, store: optionOverrides } = useChartTypeOptions()

  const data = parseData(config.data.value)
  // Mirror useChartPreview single-series collapse for legacy single-series chart types.
  const singleSeriesTypes: string[] = [
    ChartType.BarVertical,
    ChartType.BarHorizontal,
    ChartType.Line,
    ChartType.VerticalBar,
    ChartType.HorizontalBar,
  ]
  if (data.series && data.series.length > 0 && singleSeriesTypes.includes(config.chartType.value)) {
    const match = data.series.find(s => s.name === config.selectedColumn.value)
    if (match) {
      data.values = match.values
    }
    delete data.series
  }

  if (data.labels.length === 0) {
    throw new Error(`renderLiveEquivalent: no labels parsed from DSL for ${config.chartType.value}`)
  }

  const renderer = getChart(config.chartType.value)
  if (!renderer) {
    throw new Error(`renderLiveEquivalent: no renderer registered for chart type ${config.chartType.value}`)
  }
  const bg = resolveBackgroundColor(container)
  const chartOpts = buildChartOptions(currentOptions.value, bg, config.chartType.value)

  const { scenes } = useScenes()
  const annotations = resolveVisibleAnnotations(
    config._base.annotations.value,
    scenes.value,
    -1,
  ).map(v => ({ ...v.config, key: v.key }))

  renderer(container, data, {
    frame: undefined,
    sort: config.sort.value,
    ...chartOpts,
    // Mirrors useChartPreview + render-chart: an explicit override wins, the
    // passthrough is the fallback. Without this line the harness compares two
    // renders that are both blind to sortMode, which is how a bar-multi
    // divergence stayed green.
    sortMode: optionOverrides[config.chartType.value]?.sortMode ?? chartOpts.sortMode,
    colorizes: config.colorizes.value.length > 0 ? config.colorizes.value : undefined,
    highlights: config.highlights.value.length > 0 ? config.highlights.value : undefined,
    areaFills: config.areaFills.value.length > 0 ? config.areaFills.value : undefined,
    annotations: annotations.length > 0 ? annotations : undefined,
    seriesOverrides: config.seriesOverrides.value.length > 0 ? config.seriesOverrides.value : undefined,
  })
}

// jsdom does not implement SVGElement.getBBox — stub it to prevent unhandled
// rejections from the async annotation expansion path in non-skipped tests.
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window.SVGElement as any).prototype.getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 })
})

// Samples whose annotation or constrained-height rendering relies on jsdom APIs
// (getBBox, computed styles) that are not implemented, or whose parity gap
// involves multi-scene / heightMode interaction that is out of scope here.
// TODO: scene-parity (out of scope for thumbnail-parity)
const SKIP_IDS = new Set([
  'temperature-anomaly',
  'bitcoin-price',
  'unemployment-rates',
  'farm-compass',
])

describe('sample thumbnail parity', () => {
  for (const sample of samples) {
    const runner = SKIP_IDS.has(sample.id) ? it.skip : it
    runner(`renders identical chart body for "${sample.title}"`, () => {
      const thumbContainer = document.createElement('div')
      document.body.appendChild(thumbContainer)
      const liveContainer = document.createElement('div')
      document.body.appendChild(liveContainer)

      try {
        renderDsl(thumbContainer, sample.dsl, { thumbnail: true })
        renderLiveEquivalent(liveContainer, sample.dsl)

        const thumbSvg = extractChartSvg(thumbContainer)
        const liveSvg = extractChartSvg(liveContainer)

        expect(thumbSvg).not.toBe('')
        expect(liveSvg).not.toBe('')
        expect(thumbSvg).toBe(liveSvg)
      }
      finally {
        document.body.removeChild(thumbContainer)
        document.body.removeChild(liveContainer)
      }
    })
  }
})
