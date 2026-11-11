export function nextOverlayColumn(columns: string[], claimed: Iterable<string>, bar?: string, after?: string): string | undefined {
  const taken = new Set(claimed)
  const free = columns.filter(name => !taken.has(name))
  const keptBar = bar !== undefined && free.includes(bar) ? bar : free[0]
  const candidates = free.filter(name => name !== keptBar)
  const start = after === undefined ? -1 : columns.indexOf(after)
  const following = candidates.find(name => columns.indexOf(name) > start)
  const reusable = columns.filter(name => taken.has(name) && name !== after)
  return following ?? candidates[0] ?? reusable[0]
}
