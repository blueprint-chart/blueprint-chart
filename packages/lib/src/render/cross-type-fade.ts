import { snapshotForFadeOut, commitFadeOut, fadeIn } from '../charts/motion'

const prevChartType = new WeakMap<HTMLElement, string>()

export function snapshotIfTypeChanged(
  container: HTMLElement,
  newChartType: string,
  transition: boolean,
): HTMLElement | null {
  if (!transition) {
    return null
  }
  const prev = prevChartType.get(container)
  if (!prev || prev === newChartType) {
    return null
  }
  return snapshotForFadeOut(container)
}

export function commitCrossTypeFade(
  container: HTMLElement,
  newChartType: string,
  overlay: HTMLElement | null,
): void {
  prevChartType.set(container, newChartType)
  if (overlay) {
    const newFrame = container.querySelector('.bc-frame')
    if (newFrame) {
      fadeIn(newFrame)
    }
    commitFadeOut(container, overlay)
  }
}

export function clearCrossTypeMarker(container: HTMLElement): void {
  prevChartType.delete(container)
}
