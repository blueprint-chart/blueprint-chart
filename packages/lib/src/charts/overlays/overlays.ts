import type { ChartData, OverlayConfig } from '../types'

export const OVERLAY_CHART_TYPES: ReadonlySet<string> = new Set(['bar-vertical', 'bar-horizontal'])

export interface ResolvedOverlay {
  key: string
  kind: 'value' | 'range'
  title: string
  color: string
  opacity: number
  pattern: 'solid' | 'stripes'
  low: number[]
  high: number[]
}

type Column = NonNullable<ChartData['series']>[number]

const DEFAULT_COLOR = 'currentColor'
const DEFAULT_VALUE_OPACITY = 100
const DEFAULT_RANGE_OPACITY = 30

function toNumber(cell: number | undefined): number {
  return typeof cell === 'number' ? cell : Number.NaN
}

function resolveOverlay(config: OverlayConfig, columns: Column[]): ResolvedOverlay {
  const kind = columns.length === 2 ? 'range' : 'value'
  const first = columns[0].values.map(toNumber)
  const second = (columns[1]?.values ?? columns[0].values).map(toNumber)
  const low = first.map((value, row) => Math.min(value, second[row]))
  const high = first.map((value, row) => Math.max(value, second[row]))
  const names = columns.map(column => column.name)
  const defaultTitle = kind === 'range' ? names.join(' to ') : names[0]
  const defaultOpacity = kind === 'range' ? DEFAULT_RANGE_OPACITY : DEFAULT_VALUE_OPACITY
  const opacity = (config.opacity ?? defaultOpacity) / 100
  const isStripes = kind === 'range' && config.pattern === 'stripes'
  const pattern = isStripes ? 'stripes' : 'solid'
  const key = config.columns.join('\u001f')
  const color = config.color ?? DEFAULT_COLOR
  const title = config.title ?? defaultTitle
  return { key, kind, title, color, opacity, pattern, low, high }
}

function isDrawable(config: OverlayConfig, byName: Map<string, Column>): boolean {
  const sizeOk = config.columns.length >= 1 && config.columns.length <= 2
  const allExist = config.columns.every(name => byName.has(name))
  return !config.hidden && sizeOk && allExist
}

export function resolveOverlays(data: ChartData, overlays: OverlayConfig[] | undefined): { data: ChartData, overlays: ResolvedOverlay[] } {
  if (!overlays?.length || !data.series) {
    return { data, overlays: [] }
  }
  const byName = new Map(data.series.map(column => [column.name, column]))
  const claimed = new Set(overlays.flatMap(config => config.columns))
  const remaining = data.series.filter(column => !claimed.has(column.name))
  if (!remaining.length) {
    return { data, overlays: [] }
  }
  const drawable = overlays.filter(config => isDrawable(config, byName))
  const resolved = drawable.map(config => resolveOverlay(config, config.columns.map(name => byName.get(name)!)))
  const ranges = resolved.filter(overlay => overlay.kind === 'range')
  const values = resolved.filter(overlay => overlay.kind === 'value')
  const [bar, ...series] = remaining
  return { data: { ...data, values: bar.values, series }, overlays: [...ranges, ...values] }
}
