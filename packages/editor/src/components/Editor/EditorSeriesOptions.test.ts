import { shallowMount } from '@vue/test-utils'
import EditorSeriesOptions from './EditorSeriesOptions.vue'

vi.mock('@blueprint-chart/ui', () => ({
  FormControlCheckbox: { name: 'FormControlCheckbox', template: '<input type="checkbox" />', props: ['modelValue', 'label'] },
  FormControlColorInput: { template: '<input />' },
  FormControlButtonGroup: { template: '<div />' },
  FormControlSliderInput: { template: '<input />' },
}))

function connectGapsValue(overrides: { name: string, connectGaps?: boolean }[], globalConnectGaps: boolean) {
  const w = shallowMount(EditorSeriesOptions, {
    props: { selected: ['North'], overrides, colors: [], chartType: 'line-multi', globalConnectGaps },
  })
  const box = w.findAllComponents({ name: 'FormControlCheckbox' }).find(c => c.props('label') === 'Connect gaps')
  return box?.props('modelValue')
}

describe('EditorSeriesOptions connect gaps', () => {
  it('falls back to the global value without an override', () => {
    expect(connectGapsValue([], true)).toBe(true)
  })

  it('shows the series override over the global value', () => {
    expect(connectGapsValue([{ name: 'North', connectGaps: false }], true)).toBe(false)
  })
})
