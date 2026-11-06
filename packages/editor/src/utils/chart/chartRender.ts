import { applyTransformSteps, ChartType, parseData, resolveChartTypeOptions, serializeTableData } from '@blueprint-chart/lib'
import type { AnnotationConfig, AreaFillConfig, ChartDefinition, HighlightConfig, SeriesOverride, SortDirection } from '@blueprint-chart/lib'
import type { ChartColorize, ChartLayout } from '@/composables/useChartConfig'
import type { ChartTypeOptions } from '@/composables/useChartTypeOptions'
import { parseBpcData, type ColumnType } from '@/composables/useDataParser'
import type { TransformStep } from '@/composables/useDataTransforms'
import type { SceneOverride } from '@/composables/useScenes'
import { resolveScene, resolveSortFromTransforms, resolveVisibleAnnotations } from '@/utils/scenes'
import type { ChartState } from './chartState'

export interface RenderSnapshot {
  scenes: SceneOverride[]
  activeIndex: number
  chartType: string
  text: { title: string, description: string, byline: string, note: string, source: string, sourceUrl: string }
  layout: ChartLayout
  sort: SortDirection
  data: string
  selectedColumn: string
  colorizes: ChartColorize[]
  areaFills: AreaFillConfig[]
  seriesOverrides: SeriesOverride[]
  baseHighlights: HighlightConfig[]
  baseAnnotations: AnnotationConfig[]
  currentOptions: Partial<ChartTypeOptions>
  optionOverrides: Record<string, Partial<ChartTypeOptions>>
  table: { columns: string[], rows: string[][], columnTypes: ColumnType[] }
  steps: TransformStep[]
  chartTheme: string
}

export type ChartRender
  = | { kind: 'empty' }
    | { kind: 'chart', definition: ChartDefinition, allowDarkMode: boolean }

const singleSeriesTypes: string[] = [ChartType.BarVertical, ChartType.BarHorizontal, ChartType.Line, ChartType.VerticalBar, ChartType.HorizontalBar]

function resolveDataString(s: RenderSnapshot, scene: SceneOverride | null): string {
  // Scene data > base pipeline + scene transforms > base pipeline > base
  // config. The base pipeline always runs first: the chart's `data` block
  // holds the source table, not the pipeline's output.
  const { columns, rows, columnTypes } = s.table
  if (scene?.data !== undefined) {
    return scene.data
  }
  if (scene?.transforms?.length && columns.length > 0) {
    const base = applyTransformSteps(s.steps, columns, rows, columnTypes)
    const result = applyTransformSteps(scene.transforms, base.columns, base.rows, base.columnTypes)
    return serializeTableData(result.columns, result.rows)
  }
  if (s.steps.length > 0 && columns.length > 0) {
    const out = applyTransformSteps(s.steps, columns, rows, columnTypes)
    return serializeTableData(out.columns, out.rows)
  }
  return s.data
}

export function buildChartRender(s: RenderSnapshot): ChartRender {
  const scene = resolveScene(s.scenes, s.activeIndex)
  const chartType = scene?.chartType ?? s.chartType
  const data = parseData(resolveDataString(s, scene))

  if (data.series && data.series.length > 0 && singleSeriesTypes.includes(chartType)) {
    const match = data.series.find(series => series.name === s.selectedColumn)
    if (match) {
      data.values = match.values
    }
    delete data.series
  }

  if (data.labels.length === 0) {
    return { kind: 'empty' }
  }

  const sp = scene?.properties
  const layoutPadding = s.layout.padding

  return {
    kind: 'chart',
    allowDarkMode: s.currentOptions.allowDarkMode ?? true,
    // No scenes array: the active scene is pre-resolved above.
    definition: {
      chartType,
      data,
      options: scene?.chartTypeOptions ? { ...s.currentOptions, ...scene.chartTypeOptions } : s.currentOptions,
      frame: {
        title: (sp?.title as string | undefined) ?? (s.text.title || undefined),
        description: (sp?.description as string | undefined) ?? (s.text.description || undefined),
        byline: s.text.byline || undefined,
        note: s.text.note || undefined,
        source: (sp?.source as string | undefined) ?? (s.text.source || undefined),
        sourceUrl: (sp?.sourceUrl as string | undefined) ?? (s.text.sourceUrl || undefined),
        padding: typeof layoutPadding === 'number' ? `${layoutPadding}px` : layoutPadding,
        transparentBackground: s.layout.transparentBackground || undefined,
      },
      colorizes: scene?.colorizes ?? s.colorizes,
      highlights: scene ? (scene.highlights ?? []) : s.baseHighlights,
      areaFills: scene?.areaFills ?? s.areaFills,
      annotations: resolveVisibleAnnotations(s.baseAnnotations, s.scenes, s.activeIndex)
        .map(v => ({ ...v.config, key: v.key })),
      seriesOverrides: scene?.seriesOverrides ?? s.seriesOverrides,
      sort: resolveSortFromTransforms(scene) ?? s.sort,
      // Explicit overrides only. `buildChartOptions` does not pass the registry
      // default through either, so resolving it here would sort bar-multi and
      // bar-grouped in the canvas while renderBpc of the same file leaves them
      // in source order.
      sortMode: scene?.chartTypeOptions?.sortMode ?? s.optionOverrides[chartType]?.sortMode,
      theme: s.chartTheme,
    },
  }
}

export function snapshotFromState(state: ChartState): RenderSnapshot {
  const parsed = state.data ? parseBpcData(state.data) : undefined
  return {
    scenes: state.scenes,
    activeIndex: -1,
    chartType: state.chartType,
    text: {
      title: state.title,
      description: state.description,
      byline: state.byline,
      note: state.note,
      source: state.source,
      sourceUrl: state.sourceUrl,
    },
    layout: state.layout,
    sort: state.sort,
    data: state.data,
    selectedColumn: '',
    colorizes: state.colorizes,
    areaFills: state.areaFills,
    seriesOverrides: state.seriesOverrides,
    baseHighlights: state.highlights,
    baseAnnotations: state.annotations,
    currentOptions: resolveChartTypeOptions(state.chartType, state.optionOverrides),
    optionOverrides: { [state.chartType]: state.optionOverrides },
    table: parsed ?? { columns: [], rows: [], columnTypes: [] },
    steps: state.transforms.map((t, i) => ({ id: String(i + 1), type: t.type, config: t.config })),
    chartTheme: state.chartTheme,
  }
}
