import * as d3 from 'd3'
import type { AnnotationContext } from '../../plugins/annotations'
import { Orientation } from '../../../enums'
import type { DotPlotRow } from './rows'

export function dotPlotAnnotationContext(
  rows: DotPlotRow[],
  x: AnnotationContext['scaleY'],
  y: d3.ScaleBand<string>,
  rowY: (name: string) => number,
): Pick<AnnotationContext, 'scaleX' | 'scaleY' | 'data' | 'orientation' | 'markCenter'> {
  const byName = new Map(rows.map(r => [r.name, r]))
  return {
    scaleX: y,
    scaleY: x,
    orientation: Orientation.Horizontal,
    data: [],
    markCenter: (name) => {
      const row = byName.get(name)
      return row && { x: d3.max(row.values, v => x(v))!, y: rowY(name) }
    },
  }
}
