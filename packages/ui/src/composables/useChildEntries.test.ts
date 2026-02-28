import { defineComponent, h, nextTick, ref, type InjectionKey } from 'vue'
import { mount } from '@vue/test-utils'
import { useChildEntriesProvider, useChildEntry, type ChildEntriesContext } from './useChildEntries'

const TestKey: InjectionKey<ChildEntriesContext<{ id: string }>> = Symbol('TestEntries')

const Parent = defineComponent({
  setup(_, { slots, expose }) {
    const { entries } = useChildEntriesProvider(TestKey)
    expose({ entries })
    return () => h('div', slots.default?.())
  },
})

const ChildEntry = defineComponent({
  props: { id: { type: String, required: true } },
  setup(props) {
    useChildEntry(TestKey, () => ({ id: props.id }))
    return () => null
  },
})

function createUnmountFixture() {
  const showB = ref(true)
  let entries: ReturnType<typeof useChildEntriesProvider>['entries']
  const ParentCapture = defineComponent({
    setup(_, { slots }) {
      const result = useChildEntriesProvider(TestKey)
      entries = result.entries
      return () => h('div', slots.default?.())
    },
  })
  const wrapper = mount(defineComponent({
    setup() {
      return () =>
        h(ParentCapture, null, () =>
          showB.value
            ? [h(ChildEntry, { id: 'a', key: 'a' }), h(ChildEntry, { id: 'b', key: 'b' })]
            : [h(ChildEntry, { id: 'a', key: 'a' })],
        )
    },
  }))
  return { showB, entries: entries!, wrapper }
}

describe('useChildEntries collection', () => {
  it('collects entries from child components', async () => {
    const wrapper = mount(Parent, {
      slots: {
        default: () => [
          h(ChildEntry, { id: 'a' }),
          h(ChildEntry, { id: 'b' }),
        ],
      },
    })
    await nextTick()
    const entries = (wrapper.vm as any).entries
    expect(entries).toHaveLength(2)
    expect(entries[0].id).toBe('a')
    expect(entries[1].id).toBe('b')
  })

  it('returns empty array when no children are provided', async () => {
    const wrapper = mount(Parent)
    await nextTick()
    expect((wrapper.vm as any).entries).toHaveLength(0)
  })
})

describe('useChildEntries unmounting', () => {
  it('removes entries when child unmounts', async () => {
    const { showB, entries } = createUnmountFixture()
    await nextTick()
    expect(entries.value).toHaveLength(2)

    showB.value = false
    await nextTick()
    await nextTick()
    expect(entries.value).toHaveLength(1)
    expect(entries.value[0].id).toBe('a')
  })
})
