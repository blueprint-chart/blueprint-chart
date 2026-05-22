import type { PropertyNode } from '../dsl/types'
import { propertyMap } from '../dsl/converter'
import type { RenderOptions } from './types'

export interface LayoutResult {
  constrained: boolean
}

// L7: track which inline keys we previously set on each container so we can
// reset them when a subsequent call drops the constraint. A WeakMap keeps
// per-container state without leaking when the container is GC'd.
const appliedKeysByContainer = new WeakMap<HTMLElement, Set<string>>()

type ResettableKey = 'aspectRatio' | 'height' | 'display' | 'flexDirection' | 'overflow'

function resetPreviouslyApplied(container: HTMLElement): void {
  const prev = appliedKeysByContainer.get(container)
  if (!prev || prev.size === 0) {
    return
  }
  for (const key of prev) {
    // `as any` is safe — these are well-known CSSStyleDeclaration keys.
    (container.style as unknown as Record<string, string>)[key] = ''
  }
  prev.clear()
}

function markApplied(container: HTMLElement, key: ResettableKey): void {
  let set = appliedKeysByContainer.get(container)
  if (!set) {
    set = new Set<string>()
    appliedKeysByContainer.set(container, set)
  }
  set.add(key)
}

export function applyLayoutConstraints(
  container: HTMLElement,
  properties: PropertyNode[] | undefined,
  options: RenderOptions,
): LayoutResult {
  // L7: always clear any layout state we set previously, so dropping the
  // constraint (e.g. scene 1 omits aspectRatio) actually un-pins the element.
  resetPreviouslyApplied(container)

  if (options.ignoreLayout || !properties) {
    return { constrained: false }
  }
  const pMap = propertyMap(properties)
  const heightMode = pMap.get('heightMode')
  const ratio = pMap.get('aspectRatio')
  const fixedHeight = pMap.get('fixedHeight')

  let constrained = false
  if (heightMode === 'aspect-ratio' && ratio) {
    const parts = String(ratio).split(':').map(Number)
    if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
      container.style.aspectRatio = `${parts[0]} / ${parts[1]}`
      container.style.height = 'auto'
      markApplied(container, 'aspectRatio')
      markApplied(container, 'height')
      constrained = true
    }
  }
  else if (heightMode === 'fixed' && fixedHeight) {
    container.style.height = `${fixedHeight}px`
    markApplied(container, 'height')
    constrained = true
  }

  if (constrained) {
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    container.style.overflow = 'hidden'
    markApplied(container, 'display')
    markApplied(container, 'flexDirection')
    markApplied(container, 'overflow')
  }

  return { constrained }
}
