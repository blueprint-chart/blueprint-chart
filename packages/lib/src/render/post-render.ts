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
  if (args.theme) {
    frame.classList.forEach((cls) => {
      if (cls.startsWith('bc-theme-')) {
        frame.classList.remove(cls)
      }
    })
    frame.classList.add(`bc-theme-${args.theme}`)
  }
  if (layout.constrained) {
    frame.classList.add('bc-frame--constrained')
  }
}
