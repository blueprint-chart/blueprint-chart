import { describe, expect, it } from 'vitest'
import {
  ChartType,
  AxisDirection,
  ScaleType,
  GridStyle,
  LabelPosition,
  LabelRotation,
  TickPosition,
  FrameSizing,
  CompassDirection,
  AnnotationLineStyle,
  StrokeStyle,
  AnnotationKind,
  AnnotationAction,
  RangeAnchor,
  Orientation,
  SymbolShape,
  SymbolShowOn,
  SymbolStyle,
  SortDirection,
  SortMode,
  LegendPosition,
  Anchor,
  ValueLabelPosition,
  CrosshairDirection,
  CrosshairStyle,
  StackMode,
  LineStyle,
  ChartOptionType,
  DirectLabelMode,
  Interpolation,
  DslNodeType,
} from './enums'

function enumValues(e: Record<string, string>): string[] {
  return Object.values(e)
}

describe('ChartType', () => {
  it('has 15 members', () => {
    expect(enumValues(ChartType)).toHaveLength(15)
  })
  it('values match expected strings', () => {
    expect(ChartType.BarVertical).toBe('bar-vertical')
    expect(ChartType.BarHorizontal).toBe('bar-horizontal')
    expect(ChartType.BarMulti).toBe('bar-multi')
    expect(ChartType.ColumnStacked).toBe('column-stacked')
    expect(ChartType.BarStacked).toBe('bar-stacked')
    expect(ChartType.BarSplit).toBe('bar-split')
    expect(ChartType.BarGrouped).toBe('bar-grouped')
    expect(ChartType.Line).toBe('line')
    expect(ChartType.LineMulti).toBe('line-multi')
    expect(ChartType.Area).toBe('area')
    expect(ChartType.AreaStacked).toBe('area-stacked')
    expect(ChartType.Donut).toBe('donut')
    expect(ChartType.Pie).toBe('pie')
    expect(ChartType.VerticalBar).toBe('vertical-bar')
    expect(ChartType.HorizontalBar).toBe('horizontal-bar')
  })
})

describe('AxisDirection', () => {
  it('has 2 members', () => {
    expect(enumValues(AxisDirection)).toHaveLength(2)
  })
  it('values match', () => {
    expect(AxisDirection.Left).toBe('left')
    expect(AxisDirection.Right).toBe('right')
  })
})

describe('ScaleType', () => {
  it('has 2 members', () => {
    expect(enumValues(ScaleType)).toHaveLength(2)
  })
  it('values match', () => {
    expect(ScaleType.Linear).toBe('linear')
    expect(ScaleType.Log).toBe('log')
  })
})

describe('GridStyle', () => {
  it('has 4 members', () => {
    expect(enumValues(GridStyle)).toHaveLength(4)
  })
  it('values match', () => {
    expect(GridStyle.Solid).toBe('solid')
    expect(GridStyle.Dashed).toBe('dashed')
    expect(GridStyle.Dotted).toBe('dotted')
    expect(GridStyle.None).toBe('none')
  })
})

describe('LabelPosition', () => {
  it('has 4 members', () => {
    expect(enumValues(LabelPosition)).toHaveLength(4)
  })
  it('values match', () => {
    expect(LabelPosition.Auto).toBe('auto')
    expect(LabelPosition.Inside).toBe('inside')
    expect(LabelPosition.Outside).toBe('outside')
    expect(LabelPosition.Off).toBe('off')
  })
})

describe('LabelRotation', () => {
  it('has 3 members', () => {
    expect(enumValues(LabelRotation)).toHaveLength(3)
  })
  it('values match', () => {
    expect(LabelRotation.Auto).toBe('auto')
    expect(LabelRotation.Horizontal).toBe('horizontal')
    expect(LabelRotation.Vertical).toBe('vertical')
  })
})

describe('TickPosition', () => {
  it('has 2 members', () => {
    expect(enumValues(TickPosition)).toHaveLength(2)
  })
  it('values match', () => {
    expect(TickPosition.Above).toBe('above')
    expect(TickPosition.Below).toBe('below')
  })
})

describe('FrameSizing', () => {
  it('has 3 members', () => {
    expect(enumValues(FrameSizing)).toHaveLength(3)
  })
  it('values match', () => {
    expect(FrameSizing.Auto).toBe('auto')
    expect(FrameSizing.Standard).toBe('standard')
    expect(FrameSizing.AspectRatio).toBe('aspect-ratio')
  })
})

describe('CompassDirection', () => {
  it('has 9 members', () => {
    expect(enumValues(CompassDirection)).toHaveLength(9)
  })
  it('values match', () => {
    expect(CompassDirection.NW).toBe('NW')
    expect(CompassDirection.N).toBe('N')
    expect(CompassDirection.NE).toBe('NE')
    expect(CompassDirection.E).toBe('E')
    expect(CompassDirection.SE).toBe('SE')
    expect(CompassDirection.S).toBe('S')
    expect(CompassDirection.SW).toBe('SW')
    expect(CompassDirection.W).toBe('W')
    expect(CompassDirection.Center).toBe('center')
  })
})

describe('AnnotationLineStyle', () => {
  it('has 4 members', () => {
    expect(enumValues(AnnotationLineStyle)).toHaveLength(4)
  })
  it('values match', () => {
    expect(AnnotationLineStyle.Direct).toBe('direct')
    expect(AnnotationLineStyle.CurveLeft).toBe('curve-left')
    expect(AnnotationLineStyle.CurveRight).toBe('curve-right')
    expect(AnnotationLineStyle.Elbow).toBe('elbow')
  })
})

describe('StrokeStyle', () => {
  it('has 3 members', () => {
    expect(enumValues(StrokeStyle)).toHaveLength(3)
  })
  it('values match', () => {
    expect(StrokeStyle.Solid).toBe('solid')
    expect(StrokeStyle.Dotted).toBe('dotted')
    expect(StrokeStyle.Dashed).toBe('dashed')
  })
})

describe('AnnotationKind', () => {
  it('has 3 members', () => {
    expect(enumValues(AnnotationKind)).toHaveLength(3)
  })
  it('values match', () => {
    expect(AnnotationKind.Point).toBe('point')
    expect(AnnotationKind.Range).toBe('range')
    expect(AnnotationKind.Free).toBe('free')
  })
})

describe('AnnotationAction', () => {
  it('has 2 members', () => {
    expect(enumValues(AnnotationAction)).toHaveLength(2)
  })
  it('values match', () => {
    expect(AnnotationAction.Hide).toBe('hide')
    expect(AnnotationAction.Show).toBe('show')
  })
})

describe('RangeAnchor', () => {
  it('has 3 members', () => {
    expect(enumValues(RangeAnchor)).toHaveLength(3)
  })
  it('values match', () => {
    expect(RangeAnchor.Start).toBe('start')
    expect(RangeAnchor.Center).toBe('center')
    expect(RangeAnchor.End).toBe('end')
  })
})

describe('Orientation', () => {
  it('has 2 members', () => {
    expect(enumValues(Orientation)).toHaveLength(2)
  })
  it('values match', () => {
    expect(Orientation.Vertical).toBe('vertical')
    expect(Orientation.Horizontal).toBe('horizontal')
  })
})

describe('SymbolShape', () => {
  it('has 7 members', () => {
    expect(enumValues(SymbolShape)).toHaveLength(7)
  })
  it('values match', () => {
    expect(SymbolShape.Circle).toBe('circle')
    expect(SymbolShape.Square).toBe('square')
    expect(SymbolShape.Diamond).toBe('diamond')
    expect(SymbolShape.Triangle).toBe('triangle')
    expect(SymbolShape.TriangleDown).toBe('triangleDown')
    expect(SymbolShape.Cross).toBe('cross')
    expect(SymbolShape.Star).toBe('star')
  })
})

describe('SymbolShowOn', () => {
  it('has 4 members', () => {
    expect(enumValues(SymbolShowOn)).toHaveLength(4)
  })
  it('values match', () => {
    expect(SymbolShowOn.All).toBe('all')
    expect(SymbolShowOn.First).toBe('first')
    expect(SymbolShowOn.Last).toBe('last')
    expect(SymbolShowOn.FirstLast).toBe('firstLast')
  })
})

describe('SymbolStyle', () => {
  it('has 2 members', () => {
    expect(enumValues(SymbolStyle)).toHaveLength(2)
  })
  it('values match', () => {
    expect(SymbolStyle.Filled).toBe('filled')
    expect(SymbolStyle.Hollow).toBe('hollow')
  })
})

describe('SortDirection', () => {
  it('has 3 members', () => {
    expect(enumValues(SortDirection)).toHaveLength(3)
  })
  it('values match', () => {
    expect(SortDirection.Ascending).toBe('ascending')
    expect(SortDirection.Descending).toBe('descending')
    expect(SortDirection.None).toBe('none')
  })
})

describe('SortMode', () => {
  it('has 3 members', () => {
    expect(enumValues(SortMode)).toHaveLength(3)
  })
  it('values match', () => {
    expect(SortMode.Total).toBe('total')
    expect(SortMode.WithinGroups).toBe('within-groups')
    expect(SortMode.None).toBe('none')
  })
})

describe('LegendPosition', () => {
  it('has 4 members', () => {
    expect(enumValues(LegendPosition)).toHaveLength(4)
  })
  it('values match', () => {
    expect(LegendPosition.Top).toBe('top')
    expect(LegendPosition.Bottom).toBe('bottom')
    expect(LegendPosition.Left).toBe('left')
    expect(LegendPosition.Right).toBe('right')
  })
})

describe('Anchor', () => {
  it('has 3 members', () => {
    expect(enumValues(Anchor)).toHaveLength(3)
  })
  it('values match', () => {
    expect(Anchor.Start).toBe('start')
    expect(Anchor.Middle).toBe('middle')
    expect(Anchor.End).toBe('end')
  })
})

describe('ValueLabelPosition', () => {
  it('has 3 members', () => {
    expect(enumValues(ValueLabelPosition)).toHaveLength(3)
  })
  it('values match', () => {
    expect(ValueLabelPosition.Inside).toBe('inside')
    expect(ValueLabelPosition.Outside).toBe('outside')
    expect(ValueLabelPosition.Auto).toBe('auto')
  })
})

describe('CrosshairDirection', () => {
  it('has 3 members', () => {
    expect(enumValues(CrosshairDirection)).toHaveLength(3)
  })
  it('values match', () => {
    expect(CrosshairDirection.Both).toBe('both')
    expect(CrosshairDirection.Vertical).toBe('vertical')
    expect(CrosshairDirection.Horizontal).toBe('horizontal')
  })
})

describe('CrosshairStyle', () => {
  it('has 3 members', () => {
    expect(enumValues(CrosshairStyle)).toHaveLength(3)
  })
  it('values match', () => {
    expect(CrosshairStyle.Solid).toBe('solid')
    expect(CrosshairStyle.Dashed).toBe('dashed')
    expect(CrosshairStyle.Dotted).toBe('dotted')
  })
})

describe('StackMode', () => {
  it('has 2 members', () => {
    expect(enumValues(StackMode)).toHaveLength(2)
  })
  it('values match', () => {
    expect(StackMode.Normal).toBe('normal')
    expect(StackMode.Percent).toBe('percent')
  })
})

describe('LineStyle', () => {
  it('has 4 members', () => {
    expect(enumValues(LineStyle)).toHaveLength(4)
  })
  it('values match', () => {
    expect(LineStyle.Solid).toBe('solid')
    expect(LineStyle.Dashed).toBe('dashed')
    expect(LineStyle.Dotted).toBe('dotted')
    expect(LineStyle.None).toBe('none')
  })
})

describe('ChartOptionType', () => {
  it('has 6 members', () => {
    expect(enumValues(ChartOptionType)).toHaveLength(6)
  })
  it('values match', () => {
    expect(ChartOptionType.Colors).toBe('colors')
    expect(ChartOptionType.Boolean).toBe('boolean')
    expect(ChartOptionType.Select).toBe('select')
    expect(ChartOptionType.Text).toBe('text')
    expect(ChartOptionType.NumberFormat).toBe('numberFormat')
    expect(ChartOptionType.DateFormat).toBe('dateFormat')
  })
})

describe('DirectLabelMode', () => {
  it('has 4 members', () => {
    expect(enumValues(DirectLabelMode)).toHaveLength(4)
  })
  it('values match', () => {
    expect(DirectLabelMode.Off).toBe('')
    expect(DirectLabelMode.Auto).toBe('auto')
    expect(DirectLabelMode.Outside).toBe('outside')
    expect(DirectLabelMode.Inside).toBe('inside')
  })
})

describe('Interpolation', () => {
  it('has 8 members', () => {
    expect(enumValues(Interpolation)).toHaveLength(8)
  })
  it('values match', () => {
    expect(Interpolation.Linear).toBe('linear')
    expect(Interpolation.MonotoneX).toBe('monotoneX')
    expect(Interpolation.Step).toBe('step')
    expect(Interpolation.StepBefore).toBe('stepBefore')
    expect(Interpolation.StepAfter).toBe('stepAfter')
    expect(Interpolation.Basis).toBe('basis')
    expect(Interpolation.Cardinal).toBe('cardinal')
    expect(Interpolation.CatmullRom).toBe('catmullRom')
  })
})

describe('DslNodeType', () => {
  it('has 11 members', () => {
    expect(enumValues(DslNodeType)).toHaveLength(11)
  })
  it('values match', () => {
    expect(DslNodeType.Property).toBe('property')
    expect(DslNodeType.Data).toBe('data')
    expect(DslNodeType.Colorize).toBe('colorize')
    expect(DslNodeType.Highlight).toBe('highlight')
    expect(DslNodeType.AreaFill).toBe('area-fill')
    expect(DslNodeType.Annotation).toBe('annotation')
    expect(DslNodeType.Series).toBe('series')
    expect(DslNodeType.AnnotationVisibility).toBe('annotation-visibility')
    expect(DslNodeType.Scene).toBe('scene')
    expect(DslNodeType.Transform).toBe('transform')
    expect(DslNodeType.Chart).toBe('chart')
  })
})
