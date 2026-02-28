import { type Ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export interface DragPosition {
  x: number
  y: number
}

interface DragState {
  isDragging: boolean
  offsetX: number
  offsetY: number
}

function getPanel(el: HTMLElement | null): HTMLElement | null {
  return el?.closest('.chart-edit-floating-panel') as HTMLElement | null
}

function handleMouseDown(
  e: MouseEvent,
  headerRef: Ref<HTMLElement | null>,
  dragState: DragState,
) {
  const target = e.target as HTMLElement
  if (target.closest('button') && !target.closest('.button-drag')) {
    return
  }
  if (!headerRef.value) {
    return
  }
  dragState.isDragging = true
  const el = getPanel(headerRef.value)
  if (!el) {
    return
  }
  const rect = el.getBoundingClientRect()
  dragState.offsetX = e.clientX - rect.left
  dragState.offsetY = e.clientY - rect.top
  e.preventDefault()
}

function clampPosition(val: number, max: number): number {
  return Math.max(0, Math.min(val, max))
}

function handleMouseMove(
  e: MouseEvent,
  headerRef: Ref<HTMLElement | null>,
  containerRef: Ref<HTMLElement | null>,
  dragState: DragState,
  position: DragPosition,
) {
  if (!dragState.isDragging || !containerRef.value) {
    return
  }
  const bounds = containerRef.value.getBoundingClientRect()
  const el = getPanel(headerRef.value)
  const elWidth = el?.offsetWidth ?? 340
  const elHeight = el?.offsetHeight ?? 400
  position.x = clampPosition(e.clientX - bounds.left - dragState.offsetX, bounds.width - elWidth)
  position.y = clampPosition(e.clientY - bounds.top - dragState.offsetY, bounds.height - elHeight)
}

export function usePanelDrag(
  headerRef: Ref<HTMLElement | null>,
  containerRef: Ref<HTMLElement | null>,
  position: DragPosition,
) {
  const dragState: DragState = { isDragging: false, offsetX: 0, offsetY: 0 }

  useEventListener(headerRef, 'mousedown', (e: MouseEvent) => {
    handleMouseDown(e, headerRef, dragState)
  })
  useEventListener(document, 'mousemove', (e: MouseEvent) => {
    handleMouseMove(e, headerRef, containerRef, dragState, position)
  })
  useEventListener(document, 'mouseup', () => {
    dragState.isDragging = false
  })

  return { isDragging: dragState.isDragging }
}
