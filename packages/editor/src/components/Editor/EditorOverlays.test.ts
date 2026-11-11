import { mount } from '@vue/test-utils'
import { DEFAULT_COLORS } from '@blueprint-chart/lib'
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
    props: { modelValue: overlays, columns, targetsSeries: false },
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

describe('EditorOverlayItem cues', () => {
  const rangeColumns = ['Target', 'Budget']

  function findInput(w: ReturnType<typeof mountItem>, label: string) {
    const group = w.findAll('fieldset').find(f => f.text().startsWith(label))!
    return group.find('input')
  }

  it('emits muteIfCrosses from the range field and removes it when cleared', async () => {
    const w = mountItem({ columns: rangeColumns })
    const input = findInput(w, 'Fade bars when the range includes')
    await input.setValue('0')
    expect(lastEmitted(w).muteIfCrosses).toBe(0)
    await w.setProps({ overlay: lastEmitted(w) })
    await findInput(w, 'Fade bars when the range includes').setValue('')
    expect('muteIfCrosses' in lastEmitted(w)).toBe(false)
  })

  it('hides the fade field on a value overlay', () => {
    const w = mountItem({ columns: ['Target'] })
    expect(w.text()).not.toContain('Fade bars when the range includes')
  })

  function findCheckbox(w: ReturnType<typeof mountItem>, label: string) {
    return w.findAll('input[type="checkbox"]').find(c => c.element.closest('.form-check')?.textContent?.includes(label))!
  }

  it('shows the cue toggles on a value overlay only', () => {
    const value = mountItem({ columns: ['Target'] })
    expect(value.text()).toContain('Color bars that reach this value')
    expect(value.text()).toContain('Color bars below this value')
    expect(value.text()).not.toContain('Above color')
    const range = mountItem({ columns: rangeColumns })
    expect(range.text()).not.toContain('Color bars that reach this value')
  })

  it('ticking a cue toggle sets a color, then the title field appears', async () => {
    const w = mountItem({ columns: ['Target'] })
    await findCheckbox(w, 'Color bars that reach this value').setValue(true)
    const next = lastEmitted(w)
    expect(next.aboveColor).toBeTruthy()
    await w.setProps({ overlay: next })
    expect(w.text()).toContain('Above color')
    expect(w.text()).toContain('Above title')
    await findInput(w, 'Above title').setValue('Met')
    expect(lastEmitted(w).aboveTitle).toBe('Met')
  })

  it('defaults both cue colors away from the default bar color', async () => {
    const w = mountItem({ columns: ['Target'] })
    await findCheckbox(w, 'Color bars that reach this value').setValue(true)
    const above = lastEmitted(w).aboveColor
    await findCheckbox(w, 'Color bars below this value').setValue(true)
    const below = lastEmitted(w).belowColor
    expect(above).not.toBe(DEFAULT_COLORS[0])
    expect(below).not.toBe(DEFAULT_COLORS[0])
    expect(above).not.toBe(below)
  })

  it('unticking a cue toggle removes the color and its title only', async () => {
    const overlay: OverlayConfig = { columns: ['Target'], aboveColor: '#00aa00', aboveTitle: 'Met', belowColor: '#aa0000', belowTitle: 'Missed' }
    const w = mountItem(overlay)
    await findCheckbox(w, 'Color bars that reach this value').setValue(false)
    const next = lastEmitted(w)
    expect('aboveColor' in next).toBe(false)
    expect('aboveTitle' in next).toBe(false)
    expect(next.belowColor).toBe('#aa0000')
    expect(next.belowTitle).toBe('Missed')
    await w.setProps({ overlay: next })
    await findCheckbox(w, 'Color bars below this value').setValue(false)
    expect(Object.keys(lastEmitted(w))).toEqual(['columns'])
  })

  it('keeps what the user types while entering -0.5 keystroke by keystroke', async () => {
    const w = mountItem({ columns: rangeColumns })
    const steps = [['-', undefined], ['-0', -0], ['-0.', -0], ['-0.5', -0.5]] as const
    for (const [text, expected] of steps) {
      await findInput(w, 'Fade bars when the range includes').setValue(text)
      const emitted = w.emitted('update:overlay')
      if (emitted) {
        await w.setProps({ overlay: lastEmitted(w) })
      }
      expect(findInput(w, 'Fade bars when the range includes').element.value).toBe(text)
      if (expected !== undefined) {
        expect(Object.is(lastEmitted(w).muteIfCrosses, expected)).toBe(true)
      }
    }
  })

  it('accepts a negative muteIfCrosses and keeps the key on a lone minus', async () => {
    const w = mountItem({ columns: rangeColumns })
    await findInput(w, 'Fade bars when the range includes').setValue('-0.5')
    expect(lastEmitted(w).muteIfCrosses).toBe(-0.5)
    await w.setProps({ overlay: lastEmitted(w) })
    const before = w.emitted('update:overlay')!.length
    await findInput(w, 'Fade bars when the range includes').setValue('-')
    expect(w.emitted('update:overlay')!.length).toBe(before)
  })

  it('drops muteIfCrosses when a range switches to value', async () => {
    const w = mountItem({ columns: rangeColumns, muteIfCrosses: 0 })
    const value = w.findAll('button').find(b => b.text() === 'Value')!
    await value.trigger('click')
    expect('muteIfCrosses' in lastEmitted(w)).toBe(false)
  })

  it('drops the four target keys when a value switches to range', async () => {
    const overlay: OverlayConfig = { columns: ['Target'], aboveColor: '#00aa00', belowColor: '#aa0000', aboveTitle: 'A', belowTitle: 'B' }
    const w = mountItem(overlay)
    const range = w.findAll('button').find(b => b.text() === 'Range')!
    await range.trigger('click')
    const next = lastEmitted(w)
    expect(next.columns).toHaveLength(2)
    expect(Object.keys(next).sort()).toEqual(['columns'])
  })
})

describe('EditorOverlays under a real v-model parent', () => {
  it('switches a range overlay back to a single column and drops the pattern', async () => {
    const overlays = ref<OverlayConfig[]>([{ columns: ['Target', 'Budget'], pattern: 'stripes' }])
    const Parent = defineComponent({
      components: { EditorOverlays },
      setup: () => ({ overlays, columns }),
      template: '<EditorOverlays v-model="overlays" :columns="columns" :targets-series="false" />',
    })
    const w = mount(Parent)
    const value = w.findAll('button').find(b => b.text() === 'Value')!
    await value.trigger('click')
    await nextTick()
    expect(overlays.value).toEqual([{ columns: ['Target'] }])
  })
})

describe('EditorOverlays item identity', () => {
  it('does not hand typed fade text to the next overlay after a delete', async () => {
    const overlays = ref<OverlayConfig[]>([{ columns: ['Target', 'Budget'] }, { columns: ['Budget', 'Target'] }])
    const Parent = defineComponent({
      components: { EditorOverlays },
      setup: () => ({ overlays, columns }),
      template: '<EditorOverlays v-model="overlays" :columns="columns" :targets-series="false" />',
    })
    const w = mount(Parent)
    const fadeInputs = () => w.findAll('input').filter(i => i.attributes('id')?.startsWith('overlay-mute-'))
    await fadeInputs()[0].setValue('-')
    await w.find('button[aria-label="Delete overlay"]').trigger('click')
    await nextTick()
    expect(overlays.value).toHaveLength(1)
    expect((fadeInputs()[0].element as HTMLInputElement).value).toBe('')
  })

  it('keeps the item mounted while its overlay is edited', async () => {
    const overlays = ref<OverlayConfig[]>([{ columns: ['Target', 'Budget'] }])
    const Parent = defineComponent({
      components: { EditorOverlays },
      setup: () => ({ overlays, columns }),
      template: '<EditorOverlays v-model="overlays" :columns="columns" :targets-series="false" />',
    })
    const w = mount(Parent)
    const before = w.findComponent(EditorOverlayItem).vm.$.uid
    await w.find('input[id^="overlay-title-"]').setValue('Band')
    await nextTick()
    expect(overlays.value[0].title).toBe('Band')
    expect(w.findComponent(EditorOverlayItem).vm.$.uid).toBe(before)
  })
})

describe('EditorOverlays column rule under a real v-model parent', () => {
  const salesColumns = ['Sales', 'Low', 'High']

  function mountParent(initial: OverlayConfig[]) {
    const overlays = ref<OverlayConfig[]>(initial)
    const Parent = defineComponent({
      components: { EditorOverlays },
      setup: () => ({ overlays, columns: salesColumns }),
      template: '<EditorOverlays v-model="overlays" :columns="columns" :targets-series="false" />',
    })
    const w = mount(Parent)
    return { w, overlays }
  }

  it('keeps the bar free when a value overlay becomes a range', async () => {
    const { w, overlays } = mountParent([{ columns: ['Low'] }])
    const range = w.findAll('button').find(b => b.text() === 'Range')!
    await range.trigger('click')
    await nextTick()
    expect(overlays.value[0].columns).toEqual(['Low', 'High'])
  })

  it('never takes the selected bar column for a new overlay', async () => {
    const overlays = ref<OverlayConfig[]>([])
    const Parent = defineComponent({
      components: { EditorOverlays },
      setup: () => ({ overlays, columns: ['A', 'B', 'C'] }),
      template: '<EditorOverlays v-model="overlays" :columns="columns" :targets-series="false" bar-column="B" />',
    })
    const w = mount(Parent)
    await w.find('.button-add').trigger('click')
    await nextTick()
    expect(overlays.value[0].columns).toEqual(['A'])
  })

  it('does not reuse a claimed column on a second Add', async () => {
    const { w, overlays } = mountParent([{ columns: ['Low'] }])
    await w.find('.button-add').trigger('click')
    await nextTick()
    expect(overlays.value[1].columns).toEqual(['High'])
  })
})

describe('EditorOverlays bar picker', () => {
  const medalColumns = ['Gold', 'Silver', 'Bronze']

  function mountSeries(targetsSeries: boolean, initial: OverlayConfig[]) {
    const overlays = ref<OverlayConfig[]>(initial)
    const Parent = defineComponent({
      components: { EditorOverlays },
      setup: () => ({ overlays, columns: medalColumns, targetsSeries }),
      template: '<EditorOverlays v-model="overlays" :columns="columns" :targets-series="targetsSeries" />',
    })
    const w = mount(Parent)
    return { w, overlays }
  }

  function barField(w: ReturnType<typeof mount>) {
    return w.findAllComponents({ name: 'FormControlDropdown' }).find(c => c.props('label') === 'Bar')
  }

  it('offers the unclaimed columns and emits the picked bar', async () => {
    const { w, overlays } = mountSeries(true, [{ columns: ['Gold'] }])
    const field = barField(w)!
    const options = field.props('options') as { value: string }[]
    expect(options.map(o => o.value)).toEqual(['Silver', 'Bronze'])
    expect(field.text()).toContain('Silver')
    field.vm.$emit('update:modelValue', 'Silver')
    await nextTick()
    expect(overlays.value[0].bar).toBe('Silver')
  })

  it('writes the first free series as the bar of a new overlay', async () => {
    const { w, overlays } = mountSeries(true, [])
    await w.find('.button-add').trigger('click')
    await nextTick()
    expect(overlays.value).toEqual([{ columns: ['Silver'], bar: 'Gold' }])
  })

  it('takes the column after the value for the upper bound of a range', async () => {
    const overlays = ref<OverlayConfig[]>([{ columns: ['Low'], bar: 'A' }])
    const Parent = defineComponent({
      components: { EditorOverlays },
      setup: () => ({ overlays, columns: ['A', 'B', 'Low', 'High'] }),
      template: '<EditorOverlays v-model="overlays" :columns="columns" targets-series />',
    })
    const w = mount(Parent)
    const range = w.findAll('button').find(b => b.text() === 'Range')!
    await range.trigger('click')
    await nextTick()
    expect(overlays.value[0].columns).toEqual(['Low', 'High'])
  })

  it('hides the Bar field when the type has no series', () => {
    const { w } = mountSeries(false, [{ columns: ['Gold'] }])
    expect(barField(w)).toBeUndefined()
  })

  it('shows the stored bar instead of the first option', () => {
    const { w } = mountSeries(true, [{ columns: ['Gold'], bar: 'Bronze' }])
    const field = barField(w)!
    expect(field.props('modelValue')).toBe('Bronze')
  })

  it('hides the Bar field when no column is left', () => {
    const { w } = mountSeries(true, [{ columns: ['Gold', 'Silver'] }, { columns: ['Bronze'] }])
    expect(barField(w)).toBeUndefined()
  })
})
