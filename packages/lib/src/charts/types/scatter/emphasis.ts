import type { ScatterPoint } from './points'

export function highlightedPointNames(points: ScatterPoint[], targets: string[]): Set<string> {
  const names = new Set(points.map(p => p.name))
  const selected = new Set<string>()
  for (const target of targets) {
    if (names.has(target)) {
      selected.add(target)
      continue
    }
    points.filter(p => p.group === target).forEach(p => selected.add(p.name))
  }
  return selected
}

export function splitColorOverrides(points: ScatterPoint[], overrides: Map<string, string>) {
  const names = new Set(points.map(p => p.name))
  const entries = [...overrides]
  return {
    points: new Map(entries.filter(([target]) => names.has(target))),
    groups: new Map(entries.filter(([target]) => !names.has(target))),
  }
}

export function resolvePointColor(point: ScatterPoint, overrides: Map<string, string>, groups: Map<string, string>, fallback: string): string {
  return overrides.get(point.name) ?? groups.get(point.group ?? '') ?? fallback
}
