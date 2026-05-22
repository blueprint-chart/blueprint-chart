import type { LayoutResult } from './layout-constraints'

interface PostRenderArgs {
  theme?: string
}

export function applyPostRender(
  container: HTMLElement,
  args: PostRenderArgs,
  layout: LayoutResult,
): void {
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
