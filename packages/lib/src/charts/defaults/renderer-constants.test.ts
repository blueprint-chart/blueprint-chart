import { describe, test, expect } from 'vitest'
import { Concern } from './types'
import { MATRIX } from './expectations'
import { ChartType } from '../../enums'

import { DEFAULT_COLOR as LINE_DEFAULT } from '../types/line/line'
import { DEFAULT_COLOR as AREA_DEFAULT } from '../types/area/area'
import { DEFAULT_COLORS as BAR_VERTICAL_DEFAULTS } from '../types/bar-vertical/bar-vertical'
import { DEFAULT_COLORS as BAR_HORIZONTAL_DEFAULTS } from '../types/bar-horizontal/bar-horizontal'
import { DEFAULT_COLORS as BAR_MULTI_DEFAULTS } from '../types/bar-multi/bar-multi'
import { DEFAULT_COLORS as BAR_GROUPED_DEFAULTS } from '../types/bar-grouped/bar-grouped'
import { DEFAULT_COLORS as BAR_SPLIT_DEFAULTS } from '../types/bar-split/bar-split'
import { DEFAULT_COLORS as BAR_STACKED_DEFAULTS } from '../types/bar-stacked/bar-stacked'
import { DEFAULT_COLORS as COLUMN_STACKED_DEFAULTS } from '../types/column-stacked/column-stacked'
import { DEFAULT_COLORS as LINE_MULTI_DEFAULTS } from '../types/line-multi/line-multi'
import { DEFAULT_COLORS as AREA_STACKED_DEFAULTS } from '../types/area-stacked/area-stacked'
import { DEFAULT_COLORS as DONUT_DEFAULTS } from '../types/donut/donut'

const ACTUAL: Partial<Record<ChartType, unknown>> = {
  [ChartType.Line]: LINE_DEFAULT,
  [ChartType.Area]: AREA_DEFAULT,
  [ChartType.BarVertical]: BAR_VERTICAL_DEFAULTS,
  [ChartType.BarHorizontal]: BAR_HORIZONTAL_DEFAULTS,
  [ChartType.BarMulti]: BAR_MULTI_DEFAULTS,
  [ChartType.BarGrouped]: BAR_GROUPED_DEFAULTS,
  [ChartType.BarSplit]: BAR_SPLIT_DEFAULTS,
  [ChartType.BarStacked]: BAR_STACKED_DEFAULTS,
  [ChartType.ColumnStacked]: COLUMN_STACKED_DEFAULTS,
  [ChartType.LineMulti]: LINE_MULTI_DEFAULTS,
  [ChartType.AreaStacked]: AREA_STACKED_DEFAULTS,
  [ChartType.Donut]: DONUT_DEFAULTS,
}

describe(`Concern: ${Concern.RendererConstants}`, () => {
  const cells = MATRIX[Concern.RendererConstants]
  for (const [chart, cell] of Object.entries(cells)) {
    if (cell.status === 'asserted' && 'kind' in cell && cell.kind === 'rendererConstant') {
      test(`${chart} ${cell.exportName} = ${JSON.stringify(cell.target)}`, () => {
        const actual = ACTUAL[chart as ChartType]
        expect(actual, `${chart} renderer constant ${cell.exportName} per ${cell.rule}`).toEqual(cell.target)
      })
    }
    else if (cell.status === 'todo') {
      test.todo(
        `${chart} renderer constant should be ${JSON.stringify(cell.target)} (currently ${JSON.stringify(cell.current)})`,
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
