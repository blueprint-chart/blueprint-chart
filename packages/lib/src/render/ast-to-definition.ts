import type { ChartNode } from '../dsl/types'
import type { ChartDefinition } from './types'
import type { FrameOptions } from '../charts/types'
import { parseData } from '../charts/chart-helpers'
import {
  propertyMap,
  dataEntriesToString,
  convertColorizes,
  convertHighlights,
  convertAreaFills,
  convertAnnotations,
  convertSeriesOverrides,
} from '../dsl/converter'
import { SortDirection } from '../enums'

function buildFrame(props: Map<string, string | number | boolean>): FrameOptions | undefined {
  const getString = (k: string) => {
    const v = props.get(k)
    return v == null ? undefined : String(v) || undefined
  }
  const transparentBg = props.get('transparentBackground')
  const frame: FrameOptions = {
    title: getString('title'),
    description: getString('description'),
    source: getString('source'),
    sourceUrl: getString('sourceUrl'),
    byline: getString('byline'),
    note: getString('note'),
    padding: getString('padding'),
    transparentBackground: transparentBg === true || transparentBg === 'true' || undefined,
  }
  const anySet = Object.values(frame).some(v => v !== undefined)
  return anySet ? frame : undefined
}

export function astToDefinition(ast: ChartNode): ChartDefinition {
  const pMap = propertyMap(ast.properties)
  const dataStr = ast.data ? dataEntriesToString(ast.data) : ''
  const data = parseData(dataStr)
  const sortRaw = pMap.get('sort')
  const sortStr = sortRaw == null ? undefined : String(sortRaw)
  const sort = sortStr === SortDirection.Ascending || sortStr === SortDirection.Descending
    ? (sortStr as SortDirection)
    : undefined
  const themeRaw = pMap.get('theme')

  return {
    chartType: ast.chartType,
    data,
    properties: ast.properties,
    frame: buildFrame(pMap),
    colorizes: convertColorizes(ast.colorizes),
    highlights: convertHighlights(ast.highlights),
    areaFills: convertAreaFills(ast.areaFills),
    annotations: convertAnnotations(ast.annotations),
    seriesOverrides: convertSeriesOverrides(ast.series),
    scenes: ast.scenes,
    sort,
    theme: themeRaw == null ? undefined : String(themeRaw) || undefined,
  }
}
