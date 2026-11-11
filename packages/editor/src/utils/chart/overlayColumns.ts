export function nextOverlayColumn(columns: string[], claimed: Iterable<string>, bar?: string, after?: string): string | undefined {
  const taken = new Set(claimed)
  const free = columns.filter(name => !taken.has(name))
  const keptBar = bar !== undefined && free.includes(bar) ? bar : free[0]
  const candidates = free.filter(name => name !== keptBar)
  const start = after === undefined ? -1 : columns.indexOf(after)
  const following = candidates.find(name => columns.indexOf(name) > start)
  return following ?? candidates[0]
}

export function leastUsedColumn(columns: string[], claimed: string[]): string | undefined {
  const uses = (name: string) => claimed.filter(taken => taken === name).length
  const reusable = columns.filter(name => uses(name) > 0)
  const fewest = Math.min(...reusable.map(uses))
  return reusable.find(name => uses(name) === fewest)
}

export function numberedTitle(column: string, titles: string[]): string {
  let number = 2
  while (titles.includes(`${column} ${number}`)) {
    number += 1
  }
  return `${column} ${number}`
}
