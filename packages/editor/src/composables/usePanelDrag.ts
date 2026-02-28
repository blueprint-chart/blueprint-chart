import { type Ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export interface DragPosition {
  x: number
  y: number
}

export function usePanelDrag(
  headerRef: Ref<HTMLElement | null>,
  containerRef: Ref<HTMLElement | null>,
  position: DragPosition,
) {
  let isDragging = false
  let offsetX = 0
  let offsetY = 0

  function onMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('button') && !target.closest('.button-drag')) { return }
    if (!headerRef.value) { return }

    isDragging = true
    const el = headerRef.value.closest('.chart-edit-floating-panel') as HTMLElement | null
    if (!el) { return }

    const rect = el.getBoundingClientRect()
    offsetX = e.clientX - rect.left
    offsetY = e.clientY - rect.top
    e.preventDefault()
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging || !containerRef.value) { return }

    const bounds = containerRef.value.getBoundingClientRect()
    let x = e.clientX - bounds.left - offsetX
    let y = e.clientY - bounds.top - offsetY

    const el = headerRef.value?.closest('.chart-edit-floating-panel') as HTMLElement | null
    const elWidth = el?.offsetWidth ?? 340
    const elHeight = el?.offsetHeight ?? 400

    x = Math.max(0, Math.min(x, bounds.width - elWidth))
    y = Math.max(0, Math.min(y, bounds.height - elHeight))

    position.x = x
    position.y = y
  }

  function onMouseUp() {
    isDragging = false
  }

  useEventListener(headerRef, 'mousedown', onMouseDown)
  useEventListener(document, 'mousemove', onMouseMove)
  useEventListener(document, 'mouseup', onMouseUp)

  return { isDragging }
}
