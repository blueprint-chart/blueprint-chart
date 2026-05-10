import { describe, test, expect } from 'vitest'
import { Concern } from './types'
import { MATRIX } from './expectations'
import { expectDefault } from './helpers'
import type { ChartType } from '../../enums'

describe(`Concern: ${Concern.BarLayout}`, () => {
  const cells = MATRIX[Concern.BarLayout]
  for (const [chart, cell] of Object.entries(cells)) {
    if (cell.status === 'asserted') {
      // Renderer-constant cells use a different shape; skip them here.
      // (renderer-constants.test.ts handles those.)
      if ('kind' in cell && cell.kind === 'rendererConstant') {
        continue
      }
      test(`${chart} default ${cell.optionKey} = ${JSON.stringify(cell.target)}`, () => {
        expectDefault(chart as ChartType, cell.optionKey, cell.target, cell.rule)
      })
    }
    else if (cell.status === 'todo') {
      test.todo(
        `${chart} default ${cell.optionKey} should be ${JSON.stringify(cell.target)} (currently ${JSON.stringify(cell.current)}) — ${cell.rule}`,
      )
    }
    else if (cell.status === 'na') {
      test.skip(`${chart}: N/A — ${cell.reason}`, () => {
        expect(true).toBe(true)
      })
    }
    else if (cell.status === 'open') {
      test.todo(`${chart}: open question — ${cell.notes}`)
    }
  }
})
