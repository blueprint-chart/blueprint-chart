import { useChartHistory } from '@/stores/chartHistory'

function isMac(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
}

/** True when the event carries this platform's primary modifier, and only it. */
function hasPrimaryModifier(event: KeyboardEvent): boolean {
  return isMac() ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey
}

/** Typing in a field owns its own undo stack; the chart's must not steal it. */
function isTextEntry(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el || !el.tagName) {
    return false
  }
  return el.isContentEditable
    || el.tagName === 'INPUT'
    || el.tagName === 'TEXTAREA'
    || el.tagName === 'SELECT'
    || el.closest('.cm-editor') !== null
}

/**
 * Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (plus Ctrl+Y on Windows) for chart history.
 * The toolbar buttons were the only way to reach undo, which is the one command
 * people reach for by keyboard without looking.
 */
export function useUndoShortcuts() {
  const { canUndo, canRedo, undo, redo } = useChartHistory()

  function onKeydown(event: KeyboardEvent) {
    if (isTextEntry(event.target) || !hasPrimaryModifier(event)) {
      return
    }
    const key = event.key.toLowerCase()
    const isRedo = key === 'y' || (key === 'z' && event.shiftKey)
    const isUndo = key === 'z' && !event.shiftKey
    if (!isUndo && !isRedo) {
      return
    }
    event.preventDefault()
    if (isRedo && canRedo.value) {
      redo()
    }
    else if (isUndo && canUndo.value) {
      undo()
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

  return { onKeydown }
}
