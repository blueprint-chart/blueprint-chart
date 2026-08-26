import type { ChartOptions, ChartTypeOptions } from './types'
import { parseDateOrNumber } from './date-parse'
import { AxisDirection, LabelPosition, LabelRotation } from '../enums'

export function buildVerticalAxisOptions(opts: Partial<ChartTypeOptions>): Partial<ChartOptions> {
  const hasVertical = opts.showVerticalTicks !== undefined
    || opts.verticalGridStyle !== undefined
    || opts.verticalNumberFormat !== undefined
    || opts.showVerticalAxis !== undefined
    || opts.verticalAxisDirection !== undefined
    || opts.verticalScaleType !== undefined
    || opts.verticalLabelPosition !== undefined
    || opts.verticalRangeMin
    || opts.verticalRangeMax

  if (!hasVertical) {
    return {}
  }

  const axis: NonNullable<ChartOptions['verticalAxis']> = {}

  if (opts.showVerticalTicks !== undefined) {
    axis.showTicks = opts.showVerticalTicks
  }
  if (opts.verticalAxisDirection !== undefined) {
    axis.direction = opts.verticalAxisDirection as AxisDirection
  }
  if (opts.verticalGridStyle !== undefined) {
    axis.gridStyle = opts.verticalGridStyle
  }
  if (opts.verticalNumberFormat !== undefined) {
    axis.numberFormat = opts.verticalNumberFormat
  }
  if (opts.showVerticalAxis !== undefined) {
    axis.showAxis = opts.showVerticalAxis
  }
  if (opts.verticalScaleType !== undefined) {
    axis.scaleType = opts.verticalScaleType
  }
  if (opts.verticalLabelPosition !== undefined) {
    axis.labelPosition = opts.verticalLabelPosition as LabelPosition
  }

  const vMin = parseDateOrNumber(opts.verticalRangeMin ?? '')
  const vMax = parseDateOrNumber(opts.verticalRangeMax ?? '')
  if (vMin !== undefined || vMax !== undefined) {
    axis.range = {}
    if (vMin !== undefined) {
      axis.range.min = vMin
    }
    if (vMax !== undefined) {
      axis.range.max = vMax
    }
  }

  return { verticalAxis: axis }
}

export function buildHorizontalAxisOptions(opts: Partial<ChartTypeOptions>): Partial<ChartOptions> {
  const hasHorizontal = opts.showHorizontalTicks !== undefined
    || opts.horizontalGridStyle !== undefined
    || opts.horizontalNumberFormat !== undefined
    || opts.showHorizontalAxis !== undefined
    || opts.horizontalScaleType !== undefined
    || opts.horizontalLabelPosition !== undefined
    || opts.horizontalLabelRotation !== undefined
    || opts.horizontalRangeMin
    || opts.horizontalRangeMax

  if (!hasHorizontal) {
    return {}
  }

  const axis: NonNullable<ChartOptions['horizontalAxis']> = {}

  if (opts.showHorizontalTicks !== undefined) {
    axis.showTicks = opts.showHorizontalTicks
  }
  if (opts.horizontalGridStyle !== undefined) {
    axis.gridStyle = opts.horizontalGridStyle
  }
  if (opts.horizontalNumberFormat !== undefined) {
    axis.numberFormat = opts.horizontalNumberFormat
  }
  if (opts.showHorizontalAxis !== undefined) {
    axis.showAxis = opts.showHorizontalAxis
  }
  if (opts.horizontalScaleType !== undefined) {
    axis.scaleType = opts.horizontalScaleType
  }
  if (opts.horizontalLabelPosition !== undefined) {
    axis.labelPosition = opts.horizontalLabelPosition as LabelPosition
  }
  if (opts.horizontalLabelRotation !== undefined) {
    axis.labelRotation = opts.horizontalLabelRotation as LabelRotation
  }

  const hMin = parseDateOrNumber(opts.horizontalRangeMin ?? '')
  const hMax = parseDateOrNumber(opts.horizontalRangeMax ?? '')
  if (hMin !== undefined || hMax !== undefined) {
    axis.range = {}
    if (hMin !== undefined) {
      axis.range.min = hMin
    }
    if (hMax !== undefined) {
      axis.range.max = hMax
    }
  }

  return { horizontalAxis: axis }
}
