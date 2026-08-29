import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useUndoShortcuts } from './useUndoShortcuts'

const undo = vi.fn()
const redo = vi.fn()
const canUndo = ref(true)
const canRedo = ref(true)

vi.mock('@/stores/chartHistory', () => ({
  useChartHistory: () => ({ canUndo, canRedo, undo, redo }),
}))

const Host = defineComponent({
  setup() {
    useUndoShortcuts()
    return () => h('div')
  },
})

function press(init: KeyboardEventInit & { target?: Element }) {
  const event = new KeyboardEvent('keydown', { ...init, bubbles: true, cancelable: true })
  if (init.target) {
    init.target.dispatchEvent(event)
  }
  else {
    window.dispatchEvent(event)
  }
  return event
}

describe('useUndoShortcuts (#119)', () => {
  let wrapper: ReturnType<typeof mount> | null = null

  function mountHost() {
    wrapper = mount(Host)
    return wrapper
  }

  afterEach(() => {
    // The composable listens on window; without an unmount the listeners from
    // one test fire again in the next.
    wrapper?.unmount()
    wrapper = null
  })

  beforeEach(() => {
    undo.mockClear()
    redo.mockClear()
    canUndo.value = true
    canRedo.value = true
  })

  it('undoes on Ctrl+Z', () => {
    mountHost()
    press({ key: 'z', ctrlKey: true })
    expect(undo).toHaveBeenCalledTimes(1)
  })

  it('redoes on Ctrl+Shift+Z', () => {
    mountHost()
    press({ key: 'z', ctrlKey: true, shiftKey: true })
    expect(redo).toHaveBeenCalledTimes(1)
    expect(undo).not.toHaveBeenCalled()
  })

  it('redoes on Ctrl+Y', () => {
    mountHost()
    press({ key: 'y', ctrlKey: true })
    expect(redo).toHaveBeenCalledTimes(1)
  })

  it('ignores a bare Z', () => {
    mountHost()
    press({ key: 'z' })
    expect(undo).not.toHaveBeenCalled()
  })

  it('leaves a text field its own undo stack', () => {
    mountHost()
    const input = document.createElement('input')
    document.body.appendChild(input)
    press({ key: 'z', ctrlKey: true, target: input })
    expect(undo).not.toHaveBeenCalled()
    input.remove()
  })

  it('does nothing when there is nothing to undo', () => {
    canUndo.value = false
    mountHost()
    press({ key: 'z', ctrlKey: true })
    expect(undo).not.toHaveBeenCalled()
  })
})
