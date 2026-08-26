import type { LayoutResult } from './layout-constraints'
import { applyChartAccessibility, type ChartAccessibility } from './chart-a11y'

interface PostRenderArgs {
  theme?: string
  accessibility?: ChartAccessibility
}

/** The frame footer carries a credit logo SVG, so scope the lookup to the body. */
function plotSvg(container: HTMLElement): SVGSVGElement | null {
  const body = container.querySelector('.bc-frame-body')
  return (body ?? container).querySelector('svg')
}

export function applyPostRender(
  container: HTMLElement,
  args: PostRenderArgs,
  layout: LayoutResult,
): void {
  const svg = plotSvg(container)
  if (svg && args.accessibility) {
    applyChartAccessibility(svg, args.accessibility)
  }
  const frame = container.querySelector('.bc-frame') as HTMLElement | null
  if (!frame) {
    return
  }
  // L6: always strip any stale bc-theme-* classes, regardless of whether the
  // caller supplied a new theme. Otherwise a scene that drops `theme` keeps
  // the previous scene's theme class on the frame.
  const stale: string[] = []
  frame.classList.forEach((cls) => {
    if (cls.startsWith('bc-theme-')) {
      stale.push(cls)
    }
  })
  for (const cls of stale) {
    frame.classList.remove(cls)
  }
  if (args.theme) {
    frame.classList.add(`bc-theme-${args.theme}`)
  }
  if (layout.constrained) {
    frame.classList.add('bc-frame--constrained')
  }
}
