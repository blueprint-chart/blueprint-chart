import type { PropertyNode } from '../dsl/types'
import { propertyMap } from '../dsl/converter'
import type { RenderOptions } from './types'

export interface LayoutResult {
  constrained: boolean
}

export function applyLayoutConstraints(
  container: HTMLElement,
  properties: PropertyNode[] | undefined,
  options: RenderOptions,
): LayoutResult {
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
      constrained = true
    }
  }
  else if (heightMode === 'fixed' && fixedHeight) {
    container.style.height = `${fixedHeight}px`
    constrained = true
  }

  if (constrained) {
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    container.style.overflow = 'hidden'
  }

  return { constrained }
}
