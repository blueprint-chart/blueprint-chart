import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EditorAreaFills from './EditorAreaFills.vue'
import type { AreaFillConfig } from '@blueprint-chart/lib'

// Stub sub-component to avoid deep-rendering
vi.mock('./EditorAreaFillItem.vue', () => ({
  default: {
    name: 'EditorAreaFillItem',
    template: '<div class="stub-item" />',
    props: ['id', 'fill', 'seriesNames'],
    emits: ['update:fill', 'remove'],
  },
}))

describe('EditorAreaFills', () => {
  const seriesNames = ['Revenue', 'Costs']

  function factory(fills: AreaFillConfig[] = []) {
    return mount(EditorAreaFills, {
      props: {
        modelValue: fills,
        seriesNames,
        seriesOverrides: [],
        globalInterpolation: 'linear',
      },
    })
  }

  describe('Bug 1: style parity with other annotation sections', () => {
    it('does not render its own subtitle heading', () => {
      const w = factory()
      expect(w.find('h6').exists()).toBe(false)
    })

    it('renders a ButtonAdd component instead of a BButton', () => {
      const w = factory()
      // ButtonAdd renders with class "button-add"
      expect(w.find('.button-add').exists()).toBe(true)
      // No BButton with "Add area fill" text
      expect(w.text()).not.toContain('Add area fill')
    })
  })

  describe('Bug 2: area fill interpolation defaults', () => {
    it('defaults interpolation to globalInterpolation when no series override', async () => {
      const w = factory()
      await w.setProps({ globalInterpolation: 'monotoneX' })

      // Trigger add
      await w.find('.button-add').trigger('click')
      await nextTick()

      const emitted = w.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      const newFills = emitted![0][0] as AreaFillConfig[]
      expect(newFills).toHaveLength(1)
      expect(newFills[0].interpolation).toBe('monotoneX')
    })

    it('defaults interpolation to the "from" series override interpolation', async () => {
      const overrides = [{ name: 'Revenue', interpolation: 'step' }]
      const w = factory()
      await w.setProps({
        seriesOverrides: overrides,
        globalInterpolation: 'linear',
      })

      await w.find('.button-add').trigger('click')
      await nextTick()

      const emitted = w.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      const newFills = emitted![0][0] as AreaFillConfig[]
      expect(newFills[0].interpolation).toBe('step')
    })

    it('falls back to global when from-series override is "global"', async () => {
      const overrides = [{ name: 'Revenue', interpolation: 'global' }]
      const w = factory()
      await w.setProps({
        seriesOverrides: overrides,
        globalInterpolation: 'basis',
      })

      await w.find('.button-add').trigger('click')
      await nextTick()

      const emitted = w.emitted('update:modelValue')
      const newFills = emitted![0][0] as AreaFillConfig[]
      expect(newFills[0].interpolation).toBe('basis')
    })
  })
})
