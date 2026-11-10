export function nextOverlayColumn(columns: string[], claimed: Iterable<string>): string | undefined {
  const taken = new Set(claimed)
  const free = columns.filter(name => !taken.has(name))
  return free[1]
}
