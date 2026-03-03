import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { parseAspectRatio, useCanvasCardStyle } from './useCanvasCardStyle'
import { layoutDefaults, type ChartLayout } from './useChartConfig'

function makeLayout(overrides: Partial<ChartLayout> = {}): ChartLayout {
  return { ...layoutDefaults, ...overrides }
}

describe('parseAspectRatio', () => {
  it('parses valid ratio', () => {
    expect(parseAspectRatio('16:9')).toBeCloseTo(16 / 9)
  })

  it('parses 1:1 ratio', () => {
    expect(parseAspectRatio('1:1')).toBe(1)
  })

  it('returns undefined for invalid format', () => {
    expect(parseAspectRatio('invalid')).toBeUndefined()
  })

  it('returns undefined for zero denominator', () => {
    expect(parseAspectRatio('16:0')).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(parseAspectRatio('')).toBeUndefined()
  })
})

describe('useCanvasCardStyle', () => {
  it('sets padding from layout', () => {
    const layout = ref(makeLayout({ padding: 32 }))
    const { cardStyle } = useCanvasCardStyle(layout, 'card')
    expect(cardStyle.value.padding).toBe('32px')
  })

  it('applies fixed width', () => {
    const layout = ref(makeLayout({ sizing: 'fixed', fixedWidth: 500 }))
    const { cardStyle } = useCanvasCardStyle(layout, 'card')
    expect(cardStyle.value.width).toBe('500px')
  })

  it('applies max-width', () => {
    const layout = ref(makeLayout({ sizing: 'max-width', maxWidth: 800 }))
    const { cardStyle } = useCanvasCardStyle(layout, 'card')
    expect(cardStyle.value.maxWidth).toBe('800px')
    expect(cardStyle.value.width).toBe('100%')
  })

  it('applies fixed height', () => {
    const layout = ref(makeLayout({ heightMode: 'fixed', fixedHeight: 300 }))
    const { cardStyle } = useCanvasCardStyle(layout, 'card')
    expect(cardStyle.value.height).toBe('300px')
  })

  it('applies aspect-ratio', () => {
    const layout = ref(makeLayout({ heightMode: 'aspect-ratio', aspectRatio: '16:9' }))
    const { cardStyle } = useCanvasCardStyle(layout, 'card')
    expect(cardStyle.value.aspectRatio).toBe(String(16 / 9))
  })

  it('does not set height or aspectRatio for auto heightMode', () => {
    const layout = ref(makeLayout({ heightMode: 'auto' }))
    const { cardStyle } = useCanvasCardStyle(layout, 'card')
    expect(cardStyle.value.height).toBeUndefined()
    expect(cardStyle.value.aspectRatio).toBeUndefined()
  })

  it('sets constrained-height class for fixed height', () => {
    const layout = ref(makeLayout({ heightMode: 'fixed' }))
    const { cardClass } = useCanvasCardStyle(layout, 'my-card')
    expect(cardClass.value).toHaveProperty('my-card--constrained-height', true)
  })

  it('sets constrained-height class for aspect-ratio', () => {
    const layout = ref(makeLayout({ heightMode: 'aspect-ratio' }))
    const { cardClass } = useCanvasCardStyle(layout, 'my-card')
    expect(cardClass.value).toHaveProperty('my-card--constrained-height', true)
  })

  it('does not set constrained-height class for auto', () => {
    const layout = ref(makeLayout({ heightMode: 'auto' }))
    const { cardClass } = useCanvasCardStyle(layout, 'my-card')
    expect(cardClass.value).toHaveProperty('my-card--constrained-height', false)
  })

  it('uses the classPrefix for all class keys', () => {
    const layout = ref(makeLayout({ sizing: 'fixed', transparentBackground: true, heightMode: 'fixed' }))
    const { cardClass } = useCanvasCardStyle(layout, 'test-prefix')
    const keys = Object.keys(cardClass.value)
    expect(keys.every(k => k.startsWith('test-prefix--'))).toBe(true)
  })

  it('sets transparent class', () => {
    const layout = ref(makeLayout({ transparentBackground: true }))
    const { cardClass } = useCanvasCardStyle(layout, 'card')
    expect(cardClass.value).toHaveProperty('card--transparent', true)
  })

  it('reacts to layout changes', () => {
    const layout = ref(makeLayout({ heightMode: 'auto' }))
    const { cardStyle, hasConstrainedHeight } = useCanvasCardStyle(layout, 'card')
    expect(cardStyle.value.aspectRatio).toBeUndefined()
    expect(hasConstrainedHeight.value).toBe(false)

    layout.value = makeLayout({ heightMode: 'aspect-ratio', aspectRatio: '4:3' })
    expect(cardStyle.value.aspectRatio).toBe(String(4 / 3))
    expect(hasConstrainedHeight.value).toBe(true)
  })
})
