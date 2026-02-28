import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import Stepper from './NavigationStepper.vue'
import StepperStep from './NavigationStepperStep.vue'

const steps = [
  { label: 'Upload' },
  { label: 'Check' },
  { label: 'Edit' },
  { label: 'Export' },
]

describe('Stepper step states', () => {
  it('applies correct step states based on currentStep', () => {
    const wrapper = mount(Stepper, { props: { steps, currentStep: 2 } })
    const stepEls = wrapper.findAll('.navigation-stepper__step')

    expect(stepEls[0].classes()).toContain('navigation-stepper__step--done')
    expect(stepEls[1].classes()).toContain('navigation-stepper__step--done')
    expect(stepEls[2].classes()).toContain('navigation-stepper__step--current')
    expect(stepEls[3].classes()).not.toContain('navigation-stepper__step--done')
    expect(stepEls[3].classes()).not.toContain('navigation-stepper__step--current')
  })

  it('emits update:currentStep with step index on click', async () => {
    const wrapper = mount(Stepper, { props: { steps, currentStep: 0 } })
    await wrapper.findAll('.navigation-stepper__step')[2].trigger('click')
    expect(wrapper.emitted('update:currentStep')).toEqual([[2]])
  })
})

describe('Stepper disabled steps', () => {
  it('applies disabled class to disabled steps', () => {
    const wrapper = mount(Stepper, { props: { steps, currentStep: 0, disabledSteps: [2, 3] } })
    const stepEls = wrapper.findAll('.navigation-stepper__step')
    expect(stepEls[0].classes()).not.toContain('navigation-stepper__step--disabled')
    expect(stepEls[1].classes()).not.toContain('navigation-stepper__step--disabled')
    expect(stepEls[2].classes()).toContain('navigation-stepper__step--disabled')
    expect(stepEls[3].classes()).toContain('navigation-stepper__step--disabled')
  })

  it('does not emit update:currentStep when clicking a disabled step', async () => {
    const wrapper = mount(Stepper, { props: { steps, currentStep: 0, disabledSteps: [2] } })
    const stepEls = wrapper.findAll('.navigation-stepper__step')
    await stepEls[2].trigger('click')
    expect(wrapper.emitted('update:currentStep')).toBeUndefined()
  })
})

function mountStepperWithSlots(currentStep: number) {
  return mount(Stepper, {
    props: { currentStep },
    slots: {
      default: () => [
        h(StepperStep, { label: 'Upload' }),
        h(StepperStep, { label: 'Check' }),
        h(StepperStep, { label: 'Edit' }),
        h(StepperStep, { label: 'Export' }),
      ],
    },
  })
}

describe('Stepper slot entry states', () => {
  it('applies correct step states from slot entries', async () => {
    const wrapper = mountStepperWithSlots(2)
    await nextTick()
    const stepEls = wrapper.findAll('.navigation-stepper__step')
    expect(stepEls[0].classes()).toContain('navigation-stepper__step--done')
    expect(stepEls[1].classes()).toContain('navigation-stepper__step--done')
    expect(stepEls[2].classes()).toContain('navigation-stepper__step--current')
  })
})

describe('Stepper slot entry interaction', () => {
  it('emits update:currentStep on slot entry click', async () => {
    const wrapper = mountStepperWithSlots(0)
    await nextTick()
    await wrapper.findAll('.navigation-stepper__step')[2].trigger('click')
    expect(wrapper.emitted('update:currentStep')).toEqual([[2]])
  })
})
