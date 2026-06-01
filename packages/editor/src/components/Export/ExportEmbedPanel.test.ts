import { ChartType } from '@blueprint-chart/lib'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptionsStore } from '@/stores/chartTypeOptions'
import { useAccountStore } from '@/stores/account'
import * as runtimeConfig from '@/config/runtimeConfig'
import ExportEmbedPanel from './ExportEmbedPanel.vue'

vi.mock('@blueprint-chart/ui', () => ({
  ActionCopyButton: {
    template: '<button><slot /></button>',
    props: ['text', 'label', 'variant', 'size'],
  },
}))

async function mountPanel() {
  const { default: ExportEmbedPanel } = await import('./ExportEmbedPanel.vue')
  return mount(ExportEmbedPanel, {
    global: { plugins: [createPinia()] },
  })
}

describe('ExportEmbedPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useChartConfig().reset()
    useChartTypeOptionsStore().reset()
    const config = useChartConfig()
    config.chartType.value = ChartType.BarVertical
    config.data.value = 'Label,Value\nA,10\nB,20'
    config.title.value = 'Test chart'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('never encodes an empty string into bpc64 (not even on first render)', async () => {
    // Spy on btoa to capture every call — including the very first render
    // before any post-flush effects fire.
    const btoaCalls: string[] = []
    const origBtoa = globalThis.btoa
    globalThis.btoa = (s: string) => {
      btoaCalls.push(s)
      return origBtoa(s)
    }

    try {
      const wrapper = await mountPanel()
      await nextTick()
      wrapper.unmount()
    }
    finally {
      globalThis.btoa = origBtoa
    }

    expect(btoaCalls.length).toBeGreaterThan(0)
    const emptyCall = btoaCalls.find(s => s === '')
    expect(emptyCall, `btoa('') was called — bpc64 was empty on some render`).toBeUndefined()
  })

  it('embed code contains non-empty bpc64 in final rendered HTML', async () => {
    const wrapper = await mountPanel()
    await nextTick()

    const html = wrapper.html()
    expect(html).toContain('bpc64=')
    const match = html.match(/bpc64=([^"&\s]+)/)
    expect(match?.[1], 'bpc64 must be non-empty').toBeTruthy()
  })
})

describe('ExportEmbedPanel — publish section', () => {
  it('hides the publish section when accounts are disabled', async () => {
    vi.spyOn(runtimeConfig, 'accountsEnabled').mockReturnValue(false)
    const wrapper = mount(ExportEmbedPanel, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
    })
    expect(wrapper.text()).not.toContain('Publish')
  })

  it('shows the publish section when enabled and signed in', async () => {
    vi.spyOn(runtimeConfig, 'accountsEnabled').mockReturnValue(true)
    const wrapper = mount(ExportEmbedPanel, {
      global: { plugins: [createTestingPinia({ stubActions: false, createSpy: vi.fn })] },
    })
    const account = useAccountStore()
    account.user = { id: 'u1', email: 'a@b.co' }
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Publish')
  })
})
