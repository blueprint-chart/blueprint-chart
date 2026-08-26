import type { Intent, RecommendationFitness, ShapeSignature } from './types'

export interface RawRec {
  type: string
  fitness: RecommendationFitness
  reason: string
}

type CellFn = (rowCount: number) => RawRec[]

const r = (type: string, fitness: RecommendationFitness, reason: string): RawRec => ({ type, fitness, reason })

// Each shape MUST define `none` (the no-goal default, which reproduces the
// pre-intent behavior so the editor is unaffected). Other intents are optional;
// an unmapped intent falls back to `none`.
const TABLE: Record<ShapeSignature, Partial<Record<Intent, CellFn>>> = {
  '1cat+1num': {
    'none': (rowCount) => {
      const recs = [
        r('bar-vertical', 'best', '1 categorical + 1 numeric — classic bar chart'),
        r('bar-horizontal', 'good', 'Horizontal bars work well for long labels'),
      ]
      if (rowCount <= 8) {
        recs.push(r('donut', 'good', `${rowCount} items — suitable for part-of-whole`))
        recs.push(r('pie', 'alternative', 'Pie chart for part-of-whole'))
      }
      return recs
    },
    'comparison': rowCount => TABLE['1cat+1num'].none!(rowCount),
    'ranking': () => [
      r('bar-horizontal', 'best', 'Ranked categories read best as horizontal bars'),
      r('bar-vertical', 'good', 'Vertical bars also work for ranking'),
    ],
    'part-to-whole': (rowCount) => {
      if (rowCount <= 5) {
        return [
          r('pie', 'best', `${rowCount} slices — pie reads cleanly for very small N`),
          r('donut', 'good', 'Donut for part-of-whole with a center label'),
          r('bar-vertical', 'alternative', 'Bars if precise comparison matters'),
        ]
      }
      if (rowCount <= 8) {
        return [
          r('donut', 'best', `${rowCount} slices — donut for part-of-whole`),
          r('pie', 'good', 'Pie for part-of-whole'),
          r('bar-vertical', 'alternative', 'Bars if precise comparison matters'),
        ]
      }
      return [
        r('bar-vertical', 'best', `${rowCount} categories — too many for a readable pie`),
        r('bar-horizontal', 'good', 'Horizontal bars for long labels'),
      ]
    },
    // A range needs a second numeric column to be the margin. bar-split draws
    // one panel per series, so on a single column it has no range to show.
    'range': () => [
      r('bar-vertical', 'best', 'A single numeric column carries no range — plain bars read the value directly'),
      r('bar-horizontal', 'good', 'Horizontal bars work well for long labels'),
    ],
  },
  '1cat+Nnum': {
    'none': () => [
      r('bar-multi', 'best', '1 categorical + multiple numeric columns — compare groups'),
      r('line-multi', 'good', 'Can also show as a multi-line chart'),
    ],
    'comparison': rowCount => TABLE['1cat+Nnum'].none!(rowCount),
    'ranking': rowCount => TABLE['1cat+Nnum'].none!(rowCount),
    // Crossover/trend stories read as lines, even over categorical periods (turn-6 re-cut).
    'trend': () => [
      r('line-multi', 'best', 'A trend or crossover story reads best as lines, even over categorical periods'),
      r('bar-multi', 'alternative', 'Grouped bars if per-period comparison matters more than the trend'),
    ],
    'part-to-whole': () => [
      r('bar-stacked', 'best', 'Stacked bars show composition within each category'),
      r('column-stacked', 'good', 'Stacked columns for the same composition'),
      r('bar-multi', 'alternative', 'Grouped bars if comparison beats composition'),
    ],
    'composition-over-time': () => [
      r('column-stacked', 'best', 'Stacked columns show composition across discrete periods'),
      r('bar-stacked', 'good', 'Stacked bars for the same composition'),
      r('area-stacked', 'alternative', 'Stacked area if the periods are continuous time'),
    ],
    'range': () => [
      r('bar-split', 'best', 'Diverging bars show values around a shared baseline'),
      r('bar-multi', 'alternative', 'Grouped bars if there is no shared baseline'),
    ],
  },
  '1date+1num': {
    'none': () => [
      r('line', 'best', '1 date + 1 numeric column — ideal for trend'),
      r('bar-vertical', 'alternative', 'Can also show as bars'),
    ],
    'trend': () => [
      r('line', 'best', '1 date + 1 numeric column — ideal for trend'),
      r('area', 'good', 'Filled area emphasizes magnitude over time'),
      r('bar-vertical', 'alternative', 'Can also show as bars'),
    ],
    'comparison': () => [
      r('bar-vertical', 'best', 'Bars for comparing discrete time points'),
      r('line', 'good', 'Line if the trend matters more than the comparison'),
    ],
    'ranking': () => [
      r('bar-vertical', 'best', 'Bars for ranking discrete time points'),
      r('line', 'good', 'Line for the underlying trend'),
    ],
    'part-to-whole': () => [
      r('area', 'best', 'Filled area reads as magnitude/share over time'),
      r('line', 'good', 'Line for the underlying trend'),
    ],
    'composition-over-time': () => [
      r('area', 'best', 'Filled area shows magnitude over time'),
      r('line', 'good', 'Line for the underlying trend'),
    ],
  },
  '1date+Nnum': {
    'none': () => [
      r('line-multi', 'best', '1 date + multiple numeric columns — compare trends'),
      r('bar-multi', 'alternative', 'Can also show as grouped bars'),
    ],
    'trend': rowCount => TABLE['1date+Nnum'].none!(rowCount),
    'comparison': rowCount => TABLE['1date+Nnum'].none!(rowCount),
    'ranking': rowCount => TABLE['1date+Nnum'].none!(rowCount),
    'composition-over-time': () => [
      r('area-stacked', 'best', 'Stacked area shows composition over continuous time'),
      r('column-stacked', 'good', 'Stacked columns for the same composition'),
      r('line-multi', 'alternative', 'Multi-line if composition is not the point'),
    ],
    'part-to-whole': () => [
      r('area-stacked', 'best', 'Stacked area shows share over time'),
      r('line-multi', 'good', 'Multi-line if absolute trends matter more'),
    ],
  },
  'other': {
    none: () => [
      r('bar-vertical', 'good', 'Default bar chart recommendation'),
    ],
  },
}

export function resolveCell(shape: ShapeSignature, intent: Intent, rowCount: number): RawRec[] {
  const cells = TABLE[shape]
  const cellFn = cells[intent] ?? cells.none
  if (!cellFn) {
    return [r('bar-vertical', 'good', 'Default bar chart recommendation')]
  }
  return cellFn(rowCount)
}
