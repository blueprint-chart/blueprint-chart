import { ChartType } from '@blueprint-chart/lib'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptionsStore } from '@/stores/chartTypeOptions'
import { useAccountStore } from '@/stores/account'
import { useChartSessionStore } from '@/stores/chartSession'
import { useCloudChartsStore } from '@/stores/cloudCharts'
import * as runtimeConfig from '@/config/runtimeConfig'
import ExportEmbedPanel from './ExportEmbedPanel.vue'

vi.mock('@blueprint-chart/ui', () => ({
  ActionCopyButton: {
    template: '<button class="copy-stub" :data-text="text">{{ label }}</button>',
    props: ['text', 'label', 'variant', 'size'],
  },
  AppIcon: { template: '<i />', props: ['name', 'size'] },
}))

async function mountPanel() {
  return mount(ExportEmbedPanel, {
    global: { plugins: [createPinia()] },
  })
}

describe('ExportEmbedPanel — bpc64 invariants', () => {
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
    expect(btoaCalls.find(s => s === '')).toBeUndefined()
  })

  it('embed code contains non-empty bpc64 in final rendered HTML', async () => {
    const wrapper = await mountPanel()
    await nextTick()
    const html = wrapper.html()
    expect(html).toContain('bpc64=')
    const match = html.match(/bpc64=([^"&\s]+)/)
    expect(match?.[1]).toBeTruthy()
  })
})

describe('ExportEmbedPanel — four states', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mountState() {
    return mount(ExportEmbedPanel, {
      global: { plugins: [createTestingPinia({ stubActions: false, createSpy: vi.fn })] },
    })
  }

  it('state 1 (signed out): leads with self-contained, hints sign-in, no live link', async () => {
    vi.spyOn(runtimeConfig, 'accountsEnabled').mockReturnValue(false)
    const wrapper = mountState()
    await nextTick()
    expect(wrapper.text()).toContain('Embed code')
    expect(wrapper.text()).toContain('Sign in')
    expect(wrapper.text()).not.toContain('Live link')
    expect(wrapper.text()).not.toContain('Publish')
  })

  it('state 1 (signed out): clicking the hint opens the sign-in modal', async () => {
    vi.spyOn(runtimeConfig, 'accountsEnabled').mockReturnValue(false)
    const wrapper = mountState()
    await nextTick()
    const store = useAccountStore()
    await wrapper.find('.export-embed-panel__hint a').trigger('click')
    expect(store.signInModalOpen).toBe(true)
  })

  it('state 2 (signed in, not saved): hints Save this chart, no live link yet', async () => {
    vi.spyOn(runtimeConfig, 'accountsEnabled').mockReturnValue(true)
    const wrapper = mountState()
    useAccountStore().user = { id: 'u1', email: 'a@b.co' }
    useChartSessionStore().sessionId = 'localchart1'
    await nextTick()
    expect(wrapper.text()).toContain('Embed code')
    expect(wrapper.text()).toContain('Save this chart')
    expect(wrapper.text()).not.toContain('Live link')
  })

  it('state 2: clicking "Save this chart" saves to cloud and advances to the publish prompt', async () => {
    vi.spyOn(runtimeConfig, 'accountsEnabled').mockReturnValue(true)
    const wrapper = mountState()
    // Acquire the store AFTER mount so it shares the component's pinia, and
    // configure the testing-pinia action spies the component already holds.
    const cloud = useCloudChartsStore()
    vi.mocked(cloud.syncCloud).mockResolvedValue('localchart1')
    useAccountStore().user = { id: 'u1', email: 'a@b.co' }
    useChartSessionStore().sessionId = 'localchart1'
    await nextTick()
    await wrapper.find('.export-embed-panel__hint a').trigger('click')
    await flushPromises()
    expect(cloud.syncCloud).toHaveBeenCalledWith(expect.objectContaining({ id: 'localchart1' }))
    expect(cloud.markCloudBacked).toHaveBeenCalledWith('localchart1')
    expect(wrapper.text()).toContain('Live link')
    expect(wrapper.text()).toContain('Publish live link')
  })

  it('state 3 (signed in, saved, not published): shows Publish, leads with live link', async () => {
    vi.spyOn(runtimeConfig, 'accountsEnabled').mockReturnValue(true)
    const wrapper = mountState()
    const cloud = useCloudChartsStore()
    vi.mocked(cloud.isPublished).mockResolvedValue(false)
    useAccountStore().user = { id: 'u1', email: 'a@b.co' }
    useChartSessionStore().sessionId = 'cloudchart1'
    cloud.markCloudBacked('cloudchart1')
    await nextTick()
    await flushPromises()
    expect(wrapper.text()).toContain('Live link')
    expect(wrapper.text()).toContain('Publish live link')
    expect(wrapper.text()).not.toContain('Unpublish')
    expect(wrapper.text()).toContain('Or use a self-contained copy')
  })

  it('state 4 (signed in, saved, published): shows live embed + Unpublish + self-contained', async () => {
    vi.spyOn(runtimeConfig, 'accountsEnabled').mockReturnValue(true)
    const wrapper = mountState()
    const cloud = useCloudChartsStore()
    vi.mocked(cloud.isPublished).mockResolvedValue(true)
    useAccountStore().user = { id: 'u1', email: 'a@b.co' }
    useChartSessionStore().sessionId = 'cloudchart1'
    cloud.markCloudBacked('cloudchart1')
    await nextTick()
    await flushPromises()
    expect(wrapper.text()).toContain('Copy live embed')
    expect(wrapper.text()).toContain('Unpublish')
    expect(wrapper.text()).toContain('Or use a self-contained copy')
    expect(wrapper.html()).toContain('render?id=cloudchart1')
  })
})
