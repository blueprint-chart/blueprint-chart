import { mount, type VueWrapper } from '@vue/test-utils'
import EditorInteractionSection from './EditorInteractionSection.vue'

const scenes = ref<unknown[]>([])
const layout = ref<Record<string, unknown>>({})

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({
    currentOptions: ref({}),
    availableOptionKeys: ref<string[]>([]),
    setOption: vi.fn(),
  }),
}))

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({ layout }),
}))

vi.mock('@/stores/scenes', () => ({
  useScenes: () => ({ scenes }),
}))

vi.mock('@blueprint-chart/ui', () => ({
  FormControlCheckbox: {
    template: '<input type="checkbox" :data-label="label" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
  },
  FormControlSliderInput: {
    template: '<input type="range" :data-id="id" :data-label="label" :min="min" :max="max" :step="step" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'id', 'label', 'min', 'max', 'step', 'suffix'],
    emits: ['update:modelValue'],
  },
  FormControlColorInput: { template: '<div />' },
  FormControlButtonGroup: { template: '<div />', props: ['modelValue', 'label', 'options', 'block'] },
  FormControlDropdown: { template: '<div />', props: ['modelValue', 'label', 'options', 'block'] },
}))

describe('EditorInteractionSection playback controls', () => {
  beforeEach(() => {
    scenes.value = []
    layout.value = { playerType: 'buttons', playerPosition: 'bottom', autoplay: false, loop: false, sceneDuration: 3 }
  })

  it('shows the playback controls only when the chart has scenes', async () => {
    const w = mount(EditorInteractionSection)
    expect(w.find('[data-label="Play automatically"]').exists()).toBe(false)
    scenes.value = [{}]
    await w.vm.$nextTick()
    expect(w.find('[data-label="Play automatically"]').exists()).toBe(true)
    expect(w.find('[data-label="Loop"]').exists()).toBe(true)
    expect(w.find('[data-label="Seconds per scene"]').exists()).toBe(true)
  })

  it('notes that autoplay does not run in the editor', async () => {
    scenes.value = [{}]
    const w = mount(EditorInteractionSection)
    expect(w.text()).not.toContain('not in the editor')
    layout.value.autoplay = true
    await w.vm.$nextTick()
    expect(w.text()).toContain('Plays when readers scroll to the chart, not in the editor.')
  })

  it('writes autoplay and loop to the layout', async () => {
    scenes.value = [{}]
    const layoutBefore = layout.value
    const w = mount(EditorInteractionSection)
    await w.find('[data-label="Play automatically"]').setValue(true)
    await w.find('[data-label="Loop"]').setValue(true)
    expect(layout.value.autoplay).toBe(true)
    expect(layout.value.loop).toBe(true)
    expect(layout.value).toBe(layoutBefore)
  })

  it('writes the slider value as a number', async () => {
    scenes.value = [{}]
    const w = mount(EditorInteractionSection)
    await w.find('[data-id="layout-scene-duration"]').setValue('4.5')
    expect(layout.value.sceneDuration).toBe(4.5)
  })

  it('clamps the duration to 1 to 10 and ignores non-numbers and a cleared box', async () => {
    scenes.value = [{}]
    const w = mount(EditorInteractionSection)
    const slider = w.findComponent('[data-id="layout-scene-duration"]') as VueWrapper
    slider.vm.$emit('update:modelValue', '50')
    expect(layout.value.sceneDuration).toBe(10)
    slider.vm.$emit('update:modelValue', '')
    expect(layout.value.sceneDuration).toBe(10)
    slider.vm.$emit('update:modelValue', '4')
    slider.vm.$emit('update:modelValue', 'abc')
    expect(layout.value.sceneDuration).toBe(4)
  })

  it('bounds the slider to 1 to 10 in 0.5 s steps', () => {
    scenes.value = [{}]
    const w = mount(EditorInteractionSection)
    const slider = w.find('[data-id="layout-scene-duration"]')
    expect(slider.attributes('min')).toBe('1')
    expect(slider.attributes('max')).toBe('10')
    expect(slider.attributes('step')).toBe('0.5')
  })
})
