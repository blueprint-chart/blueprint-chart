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
