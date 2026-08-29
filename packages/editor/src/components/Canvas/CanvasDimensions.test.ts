import { mount, type VueWrapper } from '@vue/test-utils'
import CanvasDimensions from './CanvasDimensions.vue'
import type { ChartLayout } from '@/stores/chartConfig'

vi.mock('@vueuse/core', () => ({
  useResizeObserver: vi.fn(),
}))

function defaultLayout(overrides: Partial<ChartLayout> = {}): ChartLayout {
  return {
    sizing: 'responsive',
    fixedWidth: 600,
    maxWidth: 660,
    heightMode: 'auto',
    fixedHeight: 400,
    aspectRatio: '16:9',
    padding: 0,
    transparentBackground: false,
    playerType: 'buttons',
    playerPosition: 'left',
    ...overrides,
  }
}

function createCardEl(): HTMLElement {
  const el = document.createElement('div')
  Object.defineProperties(el, {
    offsetLeft: { value: 100, configurable: true },
    offsetTop: { value: 50, configurable: true },
    offsetWidth: { value: 600, configurable: true },
    offsetHeight: { value: 400, configurable: true },
  })
  return el
}

function mountWithCard(layout: ChartLayout): VueWrapper {
  const cardEl = createCardEl()
  const w = mount(CanvasDimensions, {
    props: {
      cardRef: cardEl,
      canvasRef: document.createElement('div'),
      layout,
    },
  })
  // Manually trigger the update since useResizeObserver is mocked
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(w.vm as Record<string, any>).cardRect = { left: 100, top: 50, width: 600, height: 400 }
  return w
}

function getTextContents(w: VueWrapper): string[] {
  return w.findAll('text').map(t => t.text())
}

describe('CanvasDimensions', () => {
  describe('visibility', () => {
    it('does not render when cardRef is null', () => {
      const w = mount(CanvasDimensions, {
        props: { cardRef: null, canvasRef: null, layout: defaultLayout() },
      })
      expect(w.find('svg').exists()).toBe(false)
    })

    it('renders svg when card rect is available', async () => {
      const w = mountWithCard(defaultLayout())
      await w.vm.$nextTick()
      expect(w.find('svg').exists()).toBe(true)
    })
  })

  describe('width label', () => {
    it('shows "auto" for responsive sizing', async () => {
      const w = mountWithCard(defaultLayout({ sizing: 'responsive' }))
      await w.vm.$nextTick()
      expect(getTextContents(w)).toContain('auto')
    })

    it('shows fixed width for fixed sizing', async () => {
      const w = mountWithCard(defaultLayout({ sizing: 'fixed', fixedWidth: 500 }))
      await w.vm.$nextTick()
      expect(getTextContents(w)).toContain('500px')
    })

    it('shows max width for max-width sizing', async () => {
      const w = mountWithCard(defaultLayout({ sizing: 'max-width', maxWidth: 720 }))
      await w.vm.$nextTick()
      expect(getTextContents(w)).toContain('max 720px')
    })
  })

  describe('height label', () => {
    it('shows "auto" for auto height mode', async () => {
      const w = mountWithCard(defaultLayout({ heightMode: 'auto' }))
      await w.vm.$nextTick()
      const texts = getTextContents(w)
      // Both width and height are "auto" in this config
      expect(texts.filter(t => t === 'auto').length).toBe(2)
    })

    it('shows fixed height for fixed height mode', async () => {
      const w = mountWithCard(defaultLayout({ heightMode: 'fixed', fixedHeight: 300 }))
      await w.vm.$nextTick()
      expect(getTextContents(w)).toContain('300px')
    })

    it('shows aspect ratio string for aspect-ratio mode', async () => {
      const w = mountWithCard(defaultLayout({ heightMode: 'aspect-ratio', aspectRatio: '4:3' }))
      await w.vm.$nextTick()
      expect(getTextContents(w)).toContain('4:3')
    })
  })

  describe('padding visibility', () => {
    it('does not render padding groups when padding is 0', async () => {
      const w = mountWithCard(defaultLayout({ padding: 0 }))
      await w.vm.$nextTick()
      expect(w.findAll('.canvas-dimensions__line--padding').length).toBe(0)
    })

    it('renders two padding groups when padding > 0', async () => {
      const w = mountWithCard(defaultLayout({ padding: 24 }))
      await w.vm.$nextTick()
      expect(w.findAll('.canvas-dimensions__line--padding').length).toBe(2)
    })

    it('shows padding label text', async () => {
      const w = mountWithCard(defaultLayout({ padding: 16 }))
      await w.vm.$nextTick()
      expect(getTextContents(w)).toContain('16px')
    })
  })

  describe('padding layout — separate row when dimension is defined', () => {
    it('uses separate row for bottom padding when width is fixed', async () => {
      const w = mountWithCard(defaultLayout({ sizing: 'fixed', padding: 24 }))
      await w.vm.$nextTick()
      const paddingGroup = w.findAll('.canvas-dimensions__line--padding')[0]
      const lines = paddingGroup.findAll('line')
      // First line is the padding segment; its y1 should differ from the main width line y
      const mainGroup = w.findAll('.canvas-dimensions__line')[0]
      const mainLineY = mainGroup.find('line')?.attributes('y1')
      const padLineY = lines[0].attributes('y1')
      expect(padLineY).not.toBe(mainLineY)
    })

    it('uses same row for bottom padding when width is responsive', async () => {
      const w = mountWithCard(defaultLayout({ sizing: 'responsive', padding: 24 }))
      await w.vm.$nextTick()
      const paddingGroup = w.findAll('.canvas-dimensions__line--padding')[0]
      const lines = paddingGroup.findAll('line')
      const mainGroup = w.findAll('.canvas-dimensions__line')[0]
      const mainLineY = mainGroup.find('line')?.attributes('y1')
      const padLineY = lines[0].attributes('y1')
      expect(padLineY).toBe(mainLineY)
    })

    it('uses separate column for left padding when height is fixed', async () => {
      const w = mountWithCard(defaultLayout({ heightMode: 'fixed', padding: 24 }))
      await w.vm.$nextTick()
      const paddingGroup = w.findAll('.canvas-dimensions__line--padding')[1]
      const lines = paddingGroup.findAll('line')
      const mainGroup = w.findAll('.canvas-dimensions__line')[1]
      const mainLineX = mainGroup.find('line')?.attributes('x1')
      const padLineX = lines[0].attributes('x1')
      expect(padLineX).not.toBe(mainLineX)
    })

    it('uses same column for left padding when height is auto', async () => {
      const w = mountWithCard(defaultLayout({ heightMode: 'auto', padding: 24 }))
      await w.vm.$nextTick()
      const paddingGroup = w.findAll('.canvas-dimensions__line--padding')[1]
      const lines = paddingGroup.findAll('line')
      const mainGroup = w.findAll('.canvas-dimensions__line')[1]
      const mainLineX = mainGroup.find('line')?.attributes('x1')
      const padLineX = lines[0].attributes('x1')
      expect(padLineX).toBe(mainLineX)
    })
  })

  describe('main line gaps', () => {
    it('shortens width line when responsive with padding', async () => {
      const w = mountWithCard(defaultLayout({ sizing: 'responsive', padding: 24 }))
      await w.vm.$nextTick()
      const mainGroup = w.findAll('.canvas-dimensions__line')[0]
      const mainLine = mainGroup.find('line')
      // With gaps: x1 = 100 + 24 + 4 = 128, x2 = 700 - 24 - 4 = 672
      expect(mainLine?.attributes('x1')).toBe('128')
      expect(mainLine?.attributes('x2')).toBe('672')
    })

    it('keeps full width line when fixed with padding', async () => {
      const w = mountWithCard(defaultLayout({ sizing: 'fixed', padding: 24 }))
      await w.vm.$nextTick()
      const mainGroup = w.findAll('.canvas-dimensions__line')[0]
      const mainLine = mainGroup.find('line')
      expect(mainLine?.attributes('x1')).toBe('100')
      expect(mainLine?.attributes('x2')).toBe('700')
    })

    it('shortens height line when auto with padding', async () => {
      const w = mountWithCard(defaultLayout({ heightMode: 'auto', padding: 24 }))
      await w.vm.$nextTick()
      const mainGroup = w.findAll('.canvas-dimensions__line')[1]
      const mainLine = mainGroup.find('line')
      // With gaps: y1 = 50 + 24 + 4 = 78, y2 = 450 - 24 - 4 = 422
      expect(mainLine?.attributes('y1')).toBe('78')
      expect(mainLine?.attributes('y2')).toBe('422')
    })

    it('keeps full height line when fixed with padding', async () => {
      const w = mountWithCard(defaultLayout({ heightMode: 'fixed', padding: 24 }))
      await w.vm.$nextTick()
      const mainGroup = w.findAll('.canvas-dimensions__line')[1]
      const mainLine = mainGroup.find('line')
      expect(mainLine?.attributes('y1')).toBe('50')
      expect(mainLine?.attributes('y2')).toBe('450')
    })
  })
})
