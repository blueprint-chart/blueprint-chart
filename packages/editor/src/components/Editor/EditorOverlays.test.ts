import { mount } from '@vue/test-utils'
import type { OverlayConfig } from '@blueprint-chart/lib'
import EditorOverlays from './EditorOverlays.vue'
import EditorOverlayItem from './EditorOverlayItem.vue'

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const columns = ['Sales', 'Target', 'Budget']

function mountList(overlays: OverlayConfig[] = []) {
  return mount(EditorOverlays, {
    props: { modelValue: overlays, columns },
    global: {
      stubs: {
        EditorOverlayItem: {
          name: 'EditorOverlayItem',
          template: '<div class="stub-item"><button class="stub-remove" @click="$emit(\'remove\')" /></div>',
          props: ['id', 'overlay', 'columns'],
          emits: ['update:overlay', 'remove'],
        },
      },
    },
  })
}

function mountItem(overlay: OverlayConfig) {
  return mount(EditorOverlayItem, {
    props: { id: 0, overlay, columns },
  })
}

function lastEmitted(w: ReturnType<typeof mountItem>) {
  const events = w.emitted('update:overlay')!
  return events[events.length - 1][0] as OverlayConfig
}

describe('EditorOverlays', () => {
  it('adds a value overlay on the second numeric column', async () => {
    const w = mountList()
    await w.find('.button-add').trigger('click')
    const emitted = w.emitted('update:modelValue')!
    expect(emitted[0][0]).toEqual([{ columns: ['Target'] }])
  })

  it('falls back to the only column when there is one', async () => {
    const w = mountList()
    await w.setProps({ columns: ['Sales'] })
    await w.find('.button-add').trigger('click')
    const emitted = w.emitted('update:modelValue')!
    const created = (emitted[0][0] as OverlayConfig[])[0]
    expect(created.columns).toEqual(['Sales'])
  })

  it('never adds an overlay with an empty column', async () => {
    const w = mountList()
    await w.setProps({ columns: [] })
    await w.find('.button-add').trigger('click')
    const emitted = w.emitted('update:modelValue') ?? []
    const created = emitted.flatMap(args => args[0] as OverlayConfig[])
    const names = created.flatMap(overlay => overlay.columns)
    expect(names).not.toContain('')
  })

  it('removes an overlay', async () => {
    const w = mountList([{ columns: ['Target'] }, { columns: ['Budget'] }])
    await w.findAll('.stub-remove')[0].trigger('click')
    const emitted = w.emitted('update:modelValue')!
    expect(emitted[0][0]).toEqual([{ columns: ['Budget'] }])
  })
})

describe('EditorOverlayItem', () => {
  it('switches an overlay to range', async () => {
    const w = mountItem({ columns: ['Target'] })
    const range = w.findAll('button').find(b => b.text() === 'Range')!
    await range.trigger('click')
    const next = lastEmitted(w)
    expect(next.columns).toHaveLength(2)
    expect(next.columns).not.toContain('')
    expect(new Set(next.columns).size).toBe(2)
  })

  it('switches a range overlay back to value', async () => {
    const w = mountItem({ columns: ['Target', 'Budget'] })
    const value = w.findAll('button').find(b => b.text() === 'Value')!
    await value.trigger('click')
    expect(lastEmitted(w).columns).toEqual(['Target'])
  })

  it('hides an overlay, then removes the key when clicked again', async () => {
    const w = mountItem({ columns: ['Target'] })
    await w.find('button[aria-label="Hide overlay"]').trigger('click')
    const hidden = lastEmitted(w)
    expect(hidden.hidden).toBe(true)
    await w.setProps({ overlay: hidden })
    await w.find('button[aria-label="Show overlay"]').trigger('click')
    const shown = lastEmitted(w)
    expect('hidden' in shown).toBe(false)
  })

  it('hides the pattern control on a value overlay', () => {
    const w = mountItem({ columns: ['Target'] })
    expect(w.text()).not.toContain('Pattern')
  })

  it('shows the pattern control on a range overlay', () => {
    const w = mountItem({ columns: ['Target', 'Budget'] })
    expect(w.text()).toContain('Pattern')
  })

  it('emits remove from the delete button', async () => {
    const w = mountItem({ columns: ['Target'] })
    await w.find('button[aria-label="Delete overlay"]').trigger('click')
    expect(w.emitted('remove')).toHaveLength(1)
  })
})

describe('EditorOverlays under a real v-model parent', () => {
  it('switches a range overlay back to a single column and drops the pattern', async () => {
    const overlays = ref<OverlayConfig[]>([{ columns: ['Target', 'Budget'], pattern: 'stripes' }])
    const Parent = defineComponent({
      components: { EditorOverlays },
      setup: () => ({ overlays, columns }),
      template: '<EditorOverlays v-model="overlays" :columns="columns" />',
    })
    const w = mount(Parent)
    const value = w.findAll('button').find(b => b.text() === 'Value')!
    await value.trigger('click')
    await nextTick()
    expect(overlays.value).toEqual([{ columns: ['Target'] }])
  })
})
