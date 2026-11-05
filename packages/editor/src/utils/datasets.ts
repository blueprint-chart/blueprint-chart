import { dataEntriesToString, parse, parseBpcData, propertyMap, serialize, TRANSFORM_TYPES } from '@blueprint-chart/lib'
import { SCHEMA_VERSION } from '@/stores/chartSession'

export interface StoredChart {
  id: string
  dsl: string
  meta: Record<string, unknown>
}

export interface DatasetStep { type: string, config: Record<string, string> }
export interface DatasetChart { id: string, title: string, savedAt: string | null }
export interface DatasetSource { rawInput: string, sourceLabel: string }

export interface Dataset {
  key: string
  chartType: string
  data: string
  steps: DatasetStep[]
  rowCount: number
  columnCount: number
  charts: DatasetChart[]
  source: DatasetSource | null
  dsl: string
}

function readSavedAt(meta: Record<string, unknown>): string | null {
  return typeof meta.savedAt === 'string' ? meta.savedAt : null
}

function readSource(meta: Record<string, unknown>): DatasetSource | null {
  const { rawInput, sourceLabel, sourceFormat, schema } = meta
  if (sourceFormat !== 'delimited' || schema !== SCHEMA_VERSION || typeof rawInput !== 'string' || !rawInput) {
    return null
  }
  return { rawInput, sourceLabel: typeof sourceLabel === 'string' ? sourceLabel : '' }
}

function byNewest(a: { savedAt: string | null }, b: { savedAt: string | null }): number {
  if (a.savedAt === b.savedAt) {
    return 0
  }
  if (a.savedAt === null) {
    return 1
  }
  if (b.savedAt === null) {
    return -1
  }
  return b.savedAt.localeCompare(a.savedAt)
}

interface Entry {
  chart: DatasetChart
  chartType: string
  data: string
  steps: DatasetStep[]
  source: DatasetSource | null
  dsl: string
}

function toEntry({ id, dsl, meta }: StoredChart): Entry | null {
  if (dsl.trimStart().startsWith('{')) {
    return null
  }
  let ast
  try {
    ast = parse(dsl)
  }
  catch {
    return null
  }
  if (!ast.data) {
    return null
  }
  const transforms = meta.schema === SCHEMA_VERSION ? ast.transforms.filter(t => TRANSFORM_TYPES.has(t.transformType)) : []
  const steps = transforms.map(t => ({
    type: t.transformType,
    config: Object.fromEntries([...propertyMap(t.properties)].map(([k, v]) => [k, String(v)])),
  }))
  const title = propertyMap(ast.properties).get('title')
  return {
    chart: { id, title: title === undefined ? '' : String(title), savedAt: readSavedAt(meta) },
    chartType: ast.chartType,
    data: dataEntriesToString(ast.data),
    steps,
    source: readSource(meta),
    dsl: serialize({ ...ast, properties: [], colorizes: [], highlights: [], areaFills: [], annotations: [], series: [], scenes: [], transforms }),
  }
}

export function collectDatasets(charts: StoredChart[]): Dataset[] {
  const groups = new Map<string, Entry[]>()
  for (const entry of charts.map(toEntry)) {
    if (entry) {
      const key = entry.data + JSON.stringify(entry.steps)
      groups.set(key, [...(groups.get(key) ?? []), entry])
    }
  }
  return [...groups]
    .map(([key, entries]) => {
      const sorted = [...entries].sort((a, b) => byNewest(a.chart, b.chart))
      const newest = sorted[0]
      const table = parseBpcData(newest.data)
      return {
        key,
        chartType: newest.chartType,
        data: newest.data,
        steps: newest.steps,
        rowCount: table.rows.length,
        columnCount: table.columns.length,
        charts: sorted.map(e => e.chart),
        source: newest.source,
        dsl: newest.dsl,
      }
    })
    .sort((a, b) => byNewest(a.charts[0], b.charts[0]))
}
