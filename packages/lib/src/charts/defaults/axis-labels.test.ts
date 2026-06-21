import { describe, test, expect } from 'vitest'
import { ChartType, LabelPosition } from '../../enums'
import { Concern } from './types'
import { MATRIX } from './expectations'
import { expectDefault } from './helpers'

describe(`Concern: ${Concern.AxisLabels}`, () => {
  const cells = MATRIX[Concern.AxisLabels]
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

// ---------------------------------------------------------------------------
// Value-axis label position defaults
// Rule: wiki/concepts/axes-and-grid-lines.md § Bar charts default to no value axis
// ---------------------------------------------------------------------------
const RULE_BAR_NO_VALUE_AXIS = 'wiki/concepts/axes-and-grid-lines.md § Bar charts default to no value axis'

describe('value-axis label position defaults', () => {
  // Vertical bar family: value axis is vertical → verticalLabelPosition must be Off
  for (const chart of [ChartType.BarVertical, ChartType.BarMulti, ChartType.ColumnStacked] as const) {
    test(`${chart}: verticalLabelPosition default = LabelPosition.Off`, () => {
      expectDefault(chart, 'verticalLabelPosition', LabelPosition.Off, RULE_BAR_NO_VALUE_AXIS)
    })
    test(`${chart}: horizontalLabelPosition default = LabelPosition.Auto (category names kept)`, () => {
      expectDefault(chart, 'horizontalLabelPosition', LabelPosition.Auto, RULE_BAR_NO_VALUE_AXIS)
    })
  }

  // Horizontal bar family: value axis is horizontal → horizontalLabelPosition must be Off
  for (const chart of [ChartType.BarHorizontal, ChartType.BarStacked, ChartType.BarSplit, ChartType.BarGrouped] as const) {
    test(`${chart}: horizontalLabelPosition default = LabelPosition.Off`, () => {
      expectDefault(chart, 'horizontalLabelPosition', LabelPosition.Off, RULE_BAR_NO_VALUE_AXIS)
    })
    test(`${chart}: verticalLabelPosition default = LabelPosition.Auto (category names kept)`, () => {
      expectDefault(chart, 'verticalLabelPosition', LabelPosition.Auto, RULE_BAR_NO_VALUE_AXIS)
    })
  }

  // Regression guard: line and area must keep verticalLabelPosition = Auto (they rely on value-axis numbers)
  for (const chart of [ChartType.Line, ChartType.Area] as const) {
    test(`${chart}: verticalLabelPosition default = LabelPosition.Auto (not off — line/area need value-axis numbers)`, () => {
      expectDefault(chart, 'verticalLabelPosition', LabelPosition.Auto, RULE_BAR_NO_VALUE_AXIS)
    })
  }
})
