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

describe('Stepper', () => {
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
    const stepEls = wrapper.findAll('.navigation-stepper__step')

    await stepEls[2].trigger('click')
    expect(wrapper.emitted('update:currentStep')).toEqual([[2]])
  })

  it('renders connectors between steps (count = steps.length - 1)', () => {
    const wrapper = mount(Stepper, { props: { steps, currentStep: 0 } })
    const connectors = wrapper.findAll('.navigation-stepper__connector')
    expect(connectors).toHaveLength(steps.length - 1)
  })

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

describe('Stepper (slot entries)', () => {
  function mountWithSlots(currentStep: number) {
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

  it('applies correct step states from slot entries', async () => {
    const wrapper = mountWithSlots(2)
    await nextTick()
    const stepEls = wrapper.findAll('.navigation-stepper__step')
    expect(stepEls[0].classes()).toContain('navigation-stepper__step--done')
    expect(stepEls[1].classes()).toContain('navigation-stepper__step--done')
    expect(stepEls[2].classes()).toContain('navigation-stepper__step--current')
  })

  it('emits update:currentStep on slot entry click', async () => {
    const wrapper = mountWithSlots(0)
    await nextTick()
    const stepEls = wrapper.findAll('.navigation-stepper__step')
    await stepEls[2].trigger('click')
    expect(wrapper.emitted('update:currentStep')).toEqual([[2]])
  })

  it('renders connectors between slot entries', async () => {
    const wrapper = mountWithSlots(0)
    await nextTick()
    const connectors = wrapper.findAll('.navigation-stepper__connector')
    expect(connectors).toHaveLength(3)
  })
})
