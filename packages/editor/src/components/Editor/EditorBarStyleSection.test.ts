import { mount } from '@vue/test-utils'
import EditorBarStyleSection from './EditorBarStyleSection.vue'

const mockSetOption = vi.fn()
const availableOptionKeys = ref<string[]>([])
const currentOptions = ref<Record<string, unknown>>({})

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({
    currentOptions,
    availableOptionKeys,
    setOption: mockSetOption,
  }),
}))

vi.mock('@blueprint-chart/ui', () => ({
  FormControlCheckbox: {
    template: '<input type="checkbox" :data-label="label" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
  },
  FormControlSliderInput: {
    template: '<input type="range" :data-id="id" :data-label="label" :data-min="min" :data-max="max" :data-step="step" :data-suffix="suffix" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'id', 'label', 'min', 'max', 'step', 'suffix'],
    emits: ['update:modelValue'],
  },
}))

describe('EditorBarStyleSection', () => {
  beforeEach(() => {
    mockSetOption.mockClear()
    availableOptionKeys.value = []
    currentOptions.value = {}
  })

  describe('categoryLabelLine', () => {
    it('renders checkbox when option is available', () => {
      availableOptionKeys.value = ['categoryLabelLine']
      const w = mount(EditorBarStyleSection)
      expect(w.find('[data-label="Labels on separate line"]').exists()).toBe(true)
    })

    it('does not render checkbox when option is absent', () => {
      availableOptionKeys.value = ['barBackground']
      const w = mount(EditorBarStyleSection)
      expect(w.find('[data-label="Labels on separate line"]').exists()).toBe(false)
    })
  })

  describe('barGap', () => {
    it('renders the slider when the option is available', () => {
      availableOptionKeys.value = ['barGap']
      const w = mount(EditorBarStyleSection)
      expect(w.find('[data-id="opt-bar-gap"]').exists()).toBe(true)
    })

    it('does not render when the option is absent', () => {
      availableOptionKeys.value = ['barBackground']
      const w = mount(EditorBarStyleSection)
      expect(w.find('[data-id="opt-bar-gap"]').exists()).toBe(false)
    })

    it('uses 0–100 range, step 1, and a percent suffix', () => {
      availableOptionKeys.value = ['barGap']
      const w = mount(EditorBarStyleSection)
      const slider = w.find('[data-id="opt-bar-gap"]')
      expect(slider.attributes('data-min')).toBe('0')
      expect(slider.attributes('data-max')).toBe('100')
      expect(slider.attributes('data-step')).toBe('1')
      expect(slider.attributes('data-suffix')).toBe('%')
    })

    it('defaults to 60 when barGap is unset', () => {
      availableOptionKeys.value = ['barGap']
      const w = mount(EditorBarStyleSection)
      const slider = w.find('[data-id="opt-bar-gap"]')
      expect((slider.element as HTMLInputElement).value).toBe('60')
    })

    it('reflects the stored value on the slider', () => {
      availableOptionKeys.value = ['barGap']
      currentOptions.value = { barGap: '42' }
      const w = mount(EditorBarStyleSection)
      const slider = w.find('[data-id="opt-bar-gap"]')
      expect((slider.element as HTMLInputElement).value).toBe('42')
    })

    it('calls setOption with the updated value when the slider changes', async () => {
      availableOptionKeys.value = ['barGap']
      const w = mount(EditorBarStyleSection)
      const slider = w.find('[data-id="opt-bar-gap"]')
      await slider.setValue('75')
      expect(mockSetOption).toHaveBeenCalledWith('barGap', '75')
    })

    it('clamps display value to [0, 100] when the stored value is out of range', () => {
      availableOptionKeys.value = ['barGap']
      currentOptions.value = { barGap: '250' }
      const w = mount(EditorBarStyleSection)
      const slider = w.find('[data-id="opt-bar-gap"]')
      expect((slider.element as HTMLInputElement).value).toBe('100')
    })

    it('clamps stored value to [0, 100] when the slider emits out-of-range input', async () => {
      availableOptionKeys.value = ['barGap']
      const w = mount(EditorBarStyleSection)
      const slider = w.find('[data-id="opt-bar-gap"]')
      await slider.setValue('-30')
      expect(mockSetOption).toHaveBeenCalledWith('barGap', '0')
    })
  })

  describe('connectedColumns', () => {
    it('renders the toggle when the option is available', () => {
      availableOptionKeys.value = ['connectedColumns']
      const w = mount(EditorBarStyleSection)
      expect(w.find('[data-label="Connected columns"]').exists()).toBe(true)
    })

    it('hides the toggle when the active chart type does not register the option', () => {
      availableOptionKeys.value = ['barBackground']
      const w = mount(EditorBarStyleSection)
      expect(w.find('[data-label="Connected columns"]').exists()).toBe(false)
    })

    it('reflects the current option value on the toggle', () => {
      availableOptionKeys.value = ['connectedColumns']
      currentOptions.value = { connectedColumns: true }
      const w = mount(EditorBarStyleSection)
      const checkbox = w.find('[data-label="Connected columns"]')
      expect((checkbox.element as HTMLInputElement).checked).toBe(true)
    })

    it('calls setOption with true when the toggle is checked', async () => {
      availableOptionKeys.value = ['connectedColumns']
      const w = mount(EditorBarStyleSection)
      const checkbox = w.find('[data-label="Connected columns"]')
      await checkbox.setValue(true)
      expect(mockSetOption).toHaveBeenCalledWith('connectedColumns', true)
    })

    describe('opacity slider', () => {
      it('does not render when the toggle is off', () => {
        availableOptionKeys.value = ['connectedColumns', 'connectionsOpacity']
        currentOptions.value = { connectedColumns: false }
        const w = mount(EditorBarStyleSection)
        expect(w.find('[data-id="opt-connections-opacity"]').exists()).toBe(false)
      })

      it('renders when the toggle is on', () => {
        availableOptionKeys.value = ['connectedColumns', 'connectionsOpacity']
        currentOptions.value = { connectedColumns: true }
        const w = mount(EditorBarStyleSection)
        expect(w.find('[data-id="opt-connections-opacity"]').exists()).toBe(true)
      })

      it('uses 0–100 range, step 1, and a percent suffix', () => {
        availableOptionKeys.value = ['connectedColumns', 'connectionsOpacity']
        currentOptions.value = { connectedColumns: true }
        const w = mount(EditorBarStyleSection)
        const slider = w.find('[data-id="opt-connections-opacity"]')
        expect(slider.attributes('data-min')).toBe('0')
        expect(slider.attributes('data-max')).toBe('100')
        expect(slider.attributes('data-step')).toBe('1')
        expect(slider.attributes('data-suffix')).toBe('%')
      })

      it('defaults to 15% when connectionsOpacity is unset', () => {
        availableOptionKeys.value = ['connectedColumns', 'connectionsOpacity']
        currentOptions.value = { connectedColumns: true }
        const w = mount(EditorBarStyleSection)
        const slider = w.find('[data-id="opt-connections-opacity"]')
        expect((slider.element as HTMLInputElement).value).toBe('15')
      })

      it('converts a stored 0–1 decimal into a 0–100 display value', () => {
        availableOptionKeys.value = ['connectedColumns', 'connectionsOpacity']
        currentOptions.value = { connectedColumns: true, connectionsOpacity: '0.5' }
        const w = mount(EditorBarStyleSection)
        const slider = w.find('[data-id="opt-connections-opacity"]')
        expect((slider.element as HTMLInputElement).value).toBe('50')
      })

      it('stores an updated slider percent as a 0–1 decimal string', async () => {
        availableOptionKeys.value = ['connectedColumns', 'connectionsOpacity']
        currentOptions.value = { connectedColumns: true, connectionsOpacity: '0.15' }
        const w = mount(EditorBarStyleSection)
        const slider = w.find('[data-id="opt-connections-opacity"]')
        await slider.setValue('40')
        expect(mockSetOption).toHaveBeenCalledWith('connectionsOpacity', '0.4')
      })

      it('clamps display value to [0, 100] when the stored value is out of range', () => {
        availableOptionKeys.value = ['connectedColumns', 'connectionsOpacity']
        currentOptions.value = { connectedColumns: true, connectionsOpacity: '2' }
        const w = mount(EditorBarStyleSection)
        const slider = w.find('[data-id="opt-connections-opacity"]')
        expect((slider.element as HTMLInputElement).value).toBe('100')
      })

      it('clamps stored value to [0, 1] when the slider emits out-of-range input', async () => {
        availableOptionKeys.value = ['connectedColumns', 'connectionsOpacity']
        currentOptions.value = { connectedColumns: true }
        const w = mount(EditorBarStyleSection)
        const slider = w.find('[data-id="opt-connections-opacity"]')
        await slider.setValue('200')
        expect(mockSetOption).toHaveBeenCalledWith('connectionsOpacity', '1')
      })
    })
  })
})
