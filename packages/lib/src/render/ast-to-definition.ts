import type { ChartNode, TransformNode } from '../dsl/types'
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
import { SortDirection, SortMode } from '../enums'

const warnedTransformTypes = new Set<string>()

/**
 * Apply a list of transforms to derive a sortMode. Unknown transform types
 * are warned about once per process and otherwise ignored. The `sort`
 * transform maps both ascending and descending directions onto SortMode.Total
 * because the underlying chart types only support total / within-groups / none.
 */
function deriveSortModeFromTransforms(
  transforms: TransformNode[],
  current: SortMode | undefined,
  context: string,
): SortMode | undefined {
  let result = current
  for (const t of transforms) {
    if (t.transformType === 'sort') {
      result = SortMode.Total
    }
    else if (!warnedTransformTypes.has(t.transformType)) {
      warnedTransformTypes.add(t.transformType)
      console.warn(`[blueprint-chart] Unknown transform "${t.transformType}" in ${context}; ignored.`)
    }
  }
  return result
}

/** @internal — exposed for tests that need to reset the warn-once cache. */
export function __resetTransformWarnings(): void {
  warnedTransformTypes.clear()
}

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

  // S9: hoist `sortMode` from properties so it's accessible to the renderer
  // as a top-level field on ChartDefinition (chart types read it from there
  // via `state.sortMode`). The value is also still present in `properties`
  // for the option-resolver path; keeping both keeps callers consistent.
  const sortModeRaw = pMap.get('sortMode')
  let sortMode: SortMode | undefined
  if (sortModeRaw === SortMode.Total || sortModeRaw === SortMode.WithinGroups || sortModeRaw === SortMode.None) {
    sortMode = sortModeRaw as SortMode
  }

  // S9/S2: apply chart-level transforms onto sortMode. The sole supported
  // transform type today is `sort`; everything else triggers a single warning.
  sortMode = deriveSortModeFromTransforms(ast.transforms, sortMode, 'chart')

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
    sortMode,
    theme: themeRaw == null ? undefined : String(themeRaw) || undefined,
  }
}
