import { describe, expect, it, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useDslSync } from '@/composables/useDslSync'
import ChartEditDsl from './ChartEditDsl.vue'

// Regression: removing option/property lines in the DSL editor must STICK.
// The editor must generate canonical DSL in COMPACT mode — otherwise
// `ensureDefaults` backfills every chart option and the non-compact
// generator re-emits them, so deleting a line (and the blur snap-to-canonical)
// would restore the previous, expanded value.
describe('ChartEditDsl round-trip (compact canonical)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('seeds the editor with compact DSL — no default options re-expanded', async () => {
    const { applyDsl } = useDslSync()
    applyDsl('chart bar-vertical {\n  title = "Sales"\n\n  data {\n    "A" = 10\n    "B" = 20\n  }\n}')

    const wrapper = mount(ChartEditDsl, { attachTo: document.body })
    await nextTick()

    const text = wrapper.find('.cm-content').text()
    expect(text).toContain('title = "Sales"')
    // These are default options that ensureDefaults backfills; the bug emitted
    // them into the editor, ballooning the minimal chart and restoring deleted
    // lines on blur. Compact generation must omit them.
    expect(text).not.toContain('colorPalette')
    expect(text).not.toContain('showHorizontalAxis')

    wrapper.unmount()
  })
})
