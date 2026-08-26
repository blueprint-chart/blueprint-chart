import chroma from 'chroma-js'
import type { ChartData, SeriesOverride } from './types'

/**
 * The series a multi-series renderer should draw. A `data` block with no
 * `series` meta-row carries its numbers in `values` alone, which left the
 * stacked, grouped and split renderers with an empty series list and nothing
 * to draw. Such data is a stack, a group or a panel of one: it gets a single
 * unnamed series, so every category still renders one bar.
 */
export function seriesOrImplicit(data: ChartData): { name: string, values: number[] }[] {
  if (data.series) {
    return data.series
  }
  return data.values.length > 0 ? [{ name: '', values: data.values }] : []
}

/**
 * Extend `colors` so it covers `count` series. `resolveSeriesColor` indexes
 * modulo the palette length, so a chart with more series than the palette has
 * colours paints two of them identically in both the plot and the legend;
 * interpolating through LCH gives every series its own colour, the way the arc
 * renderer already does for slices. Entries chroma cannot parse are dropped
 * rather than fed to `chroma.scale`, which throws on them and would take the
 * whole render down.
 */
export function expandColorsToSeries(colors: string[], count: number): string[] {
  if (count <= colors.length) {
    return colors
  }
  const usable = colors.filter(c => chroma.valid(c))
  if (usable.length < 2) {
    return colors
  }
  return chroma.scale(usable).mode('lch').colors(count)
}

function findOverride(name: string, overrides?: SeriesOverride[]): SeriesOverride | undefined {
  return overrides?.find(o => o.name === name)
}

export function resolveSeriesColor(name: string, index: number, colors: string[], overrides?: SeriesOverride[]): string {
  const override = findOverride(name, overrides)
  return override?.color ?? colors[index % colors.length]
}

export function resolveSeriesDash(name: string, overrides?: SeriesOverride[]): string {
  const override = findOverride(name, overrides)
  return override?.dash ?? 'solid'
}

export function resolveSeriesWidth(name: string, overrides?: SeriesOverride[]): number {
  const override = findOverride(name, overrides)
  return override?.lineWidth ?? 2
}

export function resolveSeriesInterpolation(name: string, globalInterpolation: string, overrides?: SeriesOverride[]): string {
  const override = findOverride(name, overrides)
  if (!override?.interpolation || override.interpolation === 'global') {
    return globalInterpolation
  }
  return override.interpolation
}

export function isSeriesHidden(name: string, overrides?: SeriesOverride[]): boolean {
  const override = findOverride(name, overrides)
  return override?.hidden ?? false
}

export function resolveSeriesLabelMode(name: string, globalMode: string, overrides?: SeriesOverride[]): string {
  const override = findOverride(name, overrides)
  if (!override?.labelMode || override.labelMode === 'global') {
    return globalMode
  }
  return override.labelMode
}

export function resolveSeriesValueLabels(name: string, globalValueLabels: boolean | 'percent', overrides?: SeriesOverride[]): boolean | 'percent' {
  const override = findOverride(name, overrides)
  if (override?.valueLabels !== undefined) {
    return override.valueLabels
  }
  return globalValueLabels
}

export function resolveSeriesOpacity(name: string, overrides?: SeriesOverride[]): number {
  const override = findOverride(name, overrides)
  return override?.opacity ?? 1
}

export function resolveSeriesLineSymbols(name: string, globalConfig: SeriesOverride | undefined, overrides?: SeriesOverride[]): SeriesOverride | undefined {
  const override = findOverride(name, overrides)
  if (override?.lineSymbols === false) {
    return undefined
  }
  if (override?.lineSymbols === true || globalConfig) {
    return {
      name,
      symbolShape: override?.symbolShape ?? globalConfig?.symbolShape,
      symbolShowOn: override?.symbolShowOn ?? globalConfig?.symbolShowOn,
      symbolStyle: override?.symbolStyle ?? globalConfig?.symbolStyle,
      symbolSize: override?.symbolSize ?? globalConfig?.symbolSize,
      symbolOpacity: override?.symbolOpacity ?? globalConfig?.symbolOpacity,
      lineSymbols: true,
    }
  }
  return undefined
}
