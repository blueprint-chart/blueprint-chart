/**
 * Interpolate two SVG path `d` strings point-wise.
 *
 * d3's default `interpolateString` pairs numbers by document order and
 * fuses/garbles them when the two paths have different counts — observed
 * producing ~1e11 coordinates during area resizes. This splits each path
 * into a command skeleton + number list; when the skeletons match it
 * interpolates the numbers pairwise, otherwise it hard-switches at the
 * midpoint so a malformed blend is never emitted.
 */
export function interpolatePath(a: string, b: string): (t: number) => string {
  const pa = parsePath(a)
  const pb = parsePath(b)
  if (pa.skeleton !== pb.skeleton || pa.nums.length !== pb.nums.length) {
    return (t: number) => (t < 0.5 ? a : b)
  }
  const { skeleton, nums: from } = pa
  const { nums: to } = pb
  return (t: number) => {
    let i = 0
    return skeleton.replace(/#/g, () => {
      const v = from[i] + (to[i] - from[i]) * t
      i++
      return formatNum(v)
    })
  }
}

interface ParsedPath { skeleton: string, nums: number[] }

/**
 * Replace each number token with `#`, keeping command letters and
 * separators as the structural skeleton. The `#` placeholder cannot appear
 * in a valid path string, so the later `replace(/#/g, …)` is unambiguous.
 */
function parsePath(d: string): ParsedPath {
  const nums: number[] = []
  const skeleton = d.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, (m) => {
    nums.push(parseFloat(m))
    return '#'
  })
  return { skeleton, nums }
}

/** Round to 3 decimals, strip trailing zeros, avoid `-0`. */
function formatNum(v: number): string {
  const r = Math.round(v * 1000) / 1000
  return Object.is(r, -0) ? '0' : String(r)
}
