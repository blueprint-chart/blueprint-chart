import type { SeriesOverride } from './types'

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

export function resolveSeriesValueLabels(name: string, globalValueLabels: boolean, overrides?: SeriesOverride[]): boolean {
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
