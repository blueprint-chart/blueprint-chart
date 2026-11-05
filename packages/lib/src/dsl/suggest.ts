/** Edit distance between two strings, counting a swap of adjacent characters as one edit. */
function levenshtein(a: string, b: string): number {
  const rows = [Array.from({ length: b.length + 1 }, (_, j) => j)]
  for (let i = 1; i <= a.length; i++) {
    rows.push([i])
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      rows[i][j] = Math.min(rows[i][j - 1] + 1, rows[i - 1][j] + 1, rows[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1)
      }
    }
  }
  return rows[a.length][b.length]
}

/**
 * Pick the nearest candidate to `value` by edit distance. Returns undefined
 * when nothing is close enough (distance must be < half the value length, and
 * at most 3 edits) to avoid noisy suggestions.
 */
export function nearest(value: string, candidates: Iterable<string>): string | undefined {
  let best: string | undefined
  let bestDist = Infinity
  for (const c of candidates) {
    const d = levenshtein(value.toLowerCase(), c.toLowerCase())
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }
  if (best === undefined) {
    return undefined
  }
  const threshold = Math.max(1, Math.min(3, Math.floor(value.length / 2)))
  return bestDist <= threshold ? best : undefined
}
