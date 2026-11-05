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

export function resolvePointColor(point: ScatterPoint, overrides: Map<string, string>, groups: Map<string, string>, fallback: string): string {
  const group = point.group ?? ''
  return overrides.get(point.name) ?? overrides.get(group) ?? groups.get(group) ?? fallback
}
