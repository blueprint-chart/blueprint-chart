import { LabelPosition } from '../enums'

/** Height of the strip an inline category label is drawn in. */
export const CATEGORY_LABEL_HEIGHT = 13

/** Bar extent that must survive the label strip for the bar to stay a bar. */
const MIN_BAR_EXTENT_PX = 4

/**
 * Height the inline category label may take out of `extent` — a band's
 * thickness, or the plot height for column charts. Shrinks the strip, and then
 * gives up on it, rather than letting the subtraction turn the bar's own extent
 * negative: a rect with a negative height is not rendered at all, so a dense
 * chart lost every one of its bars.
 */
export function categoryLabelLineHeight(extent: number): number {
  return Math.max(0, Math.min(CATEGORY_LABEL_HEIGHT, extent - MIN_BAR_EXTENT_PX))
}

/**
 * Container width below which the left gutter cannot hold category labels:
 * `labelPositionMargins` collapses it to a couple of pixels there, and the
 * labels the axis would draw outside it land off the canvas.
 */
const NARROW_GUTTER_PX = 400

/**
 * Whether a horizontal bar chart should draw its category labels above their
 * bars instead of in the left gutter. An explicit `outside` keeps them in the
 * gutter: the author asked for them there.
 */
export function categoryLabelsNeedTheirOwnLine(containerWidth: number, verticalLabelPosition?: string): boolean {
  return containerWidth > 0
    && containerWidth < NARROW_GUTTER_PX
    && verticalLabelPosition !== LabelPosition.Outside
}
