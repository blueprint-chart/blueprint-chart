import { usePanelDrag, type DragPosition } from './usePanelDrag'

vi.mock('@vueuse/core', () => ({
  useEventListener: vi.fn((target, event, handler) => {
    const el = typeof target === 'function' ? target() : (target?.value ?? target)
    if (el && el.addEventListener) {
      el.addEventListener(event, handler)
    }
  }),
}))

function createMockContainer(width: number, height: number) {
  const el = document.createElement('div')
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left: 0, top: 0, right: width, bottom: height,
    width, height, x: 0, y: 0, toJSON: () => {},
  })
  return el
}

function createMockPanel(width: number, height: number) {
  const panel = document.createElement('div')
  panel.classList.add('panel-floating')
  Object.defineProperty(panel, 'offsetWidth', { value: width })
  Object.defineProperty(panel, 'offsetHeight', { value: height })
  vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({
    left: 50, top: 50, right: 50 + width, bottom: 50 + height,
    width, height, x: 50, y: 50, toJSON: () => {},
  })
  return panel
}

describe('usePanelDrag', () => {
  it('exports usePanelDrag function', async () => {
    const mod = await import('./usePanelDrag')
    expect(typeof mod.usePanelDrag).toBe('function')
  })

  describe('margin clamping', () => {
    let container: HTMLElement
    let panel: HTMLElement
    let header: HTMLElement
    let position: DragPosition

    beforeEach(() => {
      container = createMockContainer(800, 600)
      panel = createMockPanel(340, 400)
      header = document.createElement('div')
      panel.appendChild(header)
      container.appendChild(panel)
      document.body.appendChild(container)
      position = { x: 100, y: 100 }
    })

    it('clamps position to 16px minimum from left and top edges', () => {
      const headerRef = ref(header)
      const containerRef = ref(container)
      usePanelDrag(headerRef, containerRef, position)

      // Start drag
      header.dispatchEvent(new MouseEvent('mousedown', {
        clientX: 100, clientY: 100, bubbles: true,
      }))

      // Move to top-left corner (beyond margin)
      document.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 0, clientY: 0,
      }))

      expect(position.x).toBe(16)
      expect(position.y).toBe(16)
    })

    it('clamps position to 16px minimum from right and bottom edges', () => {
      const headerRef = ref(header)
      const containerRef = ref(container)
      usePanelDrag(headerRef, containerRef, position)

      header.dispatchEvent(new MouseEvent('mousedown', {
        clientX: 100, clientY: 100, bubbles: true,
      }))

      // Move far to bottom-right
      document.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 2000, clientY: 2000,
      }))

      // Max x = container.width(800) - panel.width(340) - margin(16) = 444
      // Max y = container.height(600) - panel.height(400) - margin(16) = 184
      expect(position.x).toBe(444)
      expect(position.y).toBe(184)
    })

    it('allows position within the valid range', () => {
      const headerRef = ref(header)
      const containerRef = ref(container)
      usePanelDrag(headerRef, containerRef, position)

      header.dispatchEvent(new MouseEvent('mousedown', {
        clientX: 100, clientY: 100, bubbles: true,
      }))

      // Move to a valid position
      // offset = click(100,100) - panel rect(50,50) = (50,50)
      // new pos = mouse - container(0,0) - offset(50,50) = (150, 100)
      document.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 200, clientY: 150,
      }))

      expect(position.x).toBe(150)
      expect(position.y).toBe(100)
    })
  })
})
