import { describe, test, expect } from 'vitest'
import { Concern } from './types'
import { MATRIX } from './expectations'
import { ChartType } from '../../enums'

import { DEFAULT_COLOR as LINE_DEFAULT } from '../types/line/line'
import { DEFAULT_COLOR as AREA_DEFAULT } from '../types/area/area'
import { DEFAULT_COLORS as BAR_VERTICAL_DEFAULTS } from '../types/bar-vertical/bar-vertical'
import { DEFAULT_COLORS as BAR_HORIZONTAL_DEFAULTS } from '../types/bar-horizontal/bar-horizontal'
import { DEFAULT_COLORS } from '../palettes'
import { DEFAULT_COLOR as SCATTER_DEFAULT } from '../types/scatter/scatter'
import { DEFAULT_COLOR as DOT_PLOT_DEFAULT } from '../types/dot-plot/dot-plot'

const ACTUAL: Partial<Record<ChartType, unknown>> = {
  [ChartType.Line]: LINE_DEFAULT,
  [ChartType.Area]: AREA_DEFAULT,
  [ChartType.BarVertical]: BAR_VERTICAL_DEFAULTS,
  [ChartType.BarHorizontal]: BAR_HORIZONTAL_DEFAULTS,
  [ChartType.BarMulti]: DEFAULT_COLORS,
  [ChartType.BarGrouped]: DEFAULT_COLORS,
  [ChartType.BarSplit]: DEFAULT_COLORS,
  [ChartType.BarStacked]: DEFAULT_COLORS,
  [ChartType.ColumnStacked]: DEFAULT_COLORS,
  [ChartType.LineMulti]: DEFAULT_COLORS,
  [ChartType.AreaStacked]: DEFAULT_COLORS,
  [ChartType.Donut]: DEFAULT_COLORS,
  [ChartType.Scatter]: SCATTER_DEFAULT,
  [ChartType.DotPlot]: DOT_PLOT_DEFAULT,
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
