import { describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ListSelectPanel from './ListSelectPanel.vue'

const stubs = {
  BButton: { template: '<button :class="$attrs.class" @click="$emit(\'click\')"><slot /></button>' },
  ListItemRow: {
    template: '<div class="list-item-row" :class="{ \'list-item-row--active\': active }" @click="$emit(\'click\')"><slot /><slot name="leading" /><slot name="actions" /></div>',
    props: ['label', 'active'],
  },
}

function factory(props: Record<string, unknown> = {}) {
  return shallowMount(ListSelectPanel, {
    props: {
      'items': ['Alpha', 'Beta', 'Gamma'],
      'selected': [],
      'onUpdate:selected': () => {
        // capture for v-model
      },
      ...props,
    },
    global: { stubs },
  })
}

describe('ListSelectPanel rendering', () => {
  it('renders a list-item-row for each item', () => {
    const wrapper = factory()
    const rows = wrapper.findAll('.list-item-row')
    expect(rows).toHaveLength(3)
  })

  it('applies max-height style with default value', () => {
    const wrapper = factory()
    const scrollDiv = wrapper.find('[style]')
    expect(scrollDiv.attributes('style')).toContain('max-height: 220px')
  })

  it('applies custom max-height', () => {
    const wrapper = factory({ maxHeight: '400px' })
    const scrollDiv = wrapper.find('[style]')
    expect(scrollDiv.attributes('style')).toContain('max-height: 400px')
  })

  it('marks active items based on selected prop', () => {
    const wrapper = factory({ selected: ['Beta'] })
    const rows = wrapper.findAll('.list-item-row')
    expect(rows[0].classes()).not.toContain('list-item-row--active')
    expect(rows[1].classes()).toContain('list-item-row--active')
    expect(rows[2].classes()).not.toContain('list-item-row--active')
  })
})

describe('ListSelectPanel selection actions', () => {
  it('emits update:selected with all items on "All" click', async () => {
    const wrapper = factory()
    const buttons = wrapper.findAll('button')
    const allBtn = buttons.find(b => b.text() === 'All')!
    await allBtn.trigger('click')
    expect(wrapper.emitted('update:selected')![0]).toEqual([['Alpha', 'Beta', 'Gamma']])
  })

  it('emits update:selected with empty array on "None" click', async () => {
    const wrapper = factory({ selected: ['Alpha', 'Beta'] })
    const buttons = wrapper.findAll('button')
    const noneBtn = buttons.find(b => b.text() === 'None')!
    await noneBtn.trigger('click')
    expect(wrapper.emitted('update:selected')![0]).toEqual([[]])
  })

  it('emits update:selected with inverted selection on "Invert" click', async () => {
    const wrapper = factory({ selected: ['Alpha'] })
    const buttons = wrapper.findAll('button')
    const invertBtn = buttons.find(b => b.text() === 'Invert')!
    await invertBtn.trigger('click')
    expect(wrapper.emitted('update:selected')![0]).toEqual([['Beta', 'Gamma']])
  })
})

describe('ListSelectPanel item click', () => {
  it('toggles an unselected item into the selection', async () => {
    const wrapper = factory({ selected: ['Alpha'] })
    const rows = wrapper.findAll('.list-item-row')
    await rows[1].trigger('click')
    expect(wrapper.emitted('update:selected')![0]).toEqual([['Alpha', 'Beta']])
  })

  it('toggles a selected item out of the selection', async () => {
    const wrapper = factory({ selected: ['Alpha', 'Beta'] })
    const rows = wrapper.findAll('.list-item-row')
    await rows[0].trigger('click')
    expect(wrapper.emitted('update:selected')![0]).toEqual([['Beta']])
  })
})

describe('ListSelectPanel slots', () => {
  it('passes item-leading slot content through', () => {
    const wrapper = shallowMount(ListSelectPanel, {
      props: {
        items: ['Alpha'],
        selected: [],
      },
      slots: {
        'item-leading': '<span class="custom-leading">icon</span>',
      },
      global: { stubs },
    })
    expect(wrapper.find('.custom-leading').exists()).toBe(true)
  })

  it('passes item-actions slot content through', () => {
    const wrapper = shallowMount(ListSelectPanel, {
      props: {
        items: ['Alpha'],
        selected: [],
      },
      slots: {
        'item-actions': '<span class="custom-action">delete</span>',
      },
      global: { stubs },
    })
    expect(wrapper.find('.custom-action').exists()).toBe(true)
  })
})
