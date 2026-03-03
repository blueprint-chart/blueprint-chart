import { describe, it, expect, beforeEach } from 'vitest'
import { useExportPanel } from './useExportPanel'

describe('useExportPanel', () => {
  beforeEach(() => {
    useExportPanel().reset()
  })

  it('starts with default state', () => {
    const { exportTab, selectedFormat, pngScale, svgInlineFonts, svgMinify, bpcIncludeData, bpcCompact } = useExportPanel()
    expect(exportTab.value).toBe('embed')
    expect(selectedFormat.value).toBe('png')
    expect(pngScale.value).toBe(2)
    expect(svgInlineFonts.value).toBe(false)
    expect(svgMinify.value).toBe(false)
    expect(bpcIncludeData.value).toBe(true)
    expect(bpcCompact.value).toBe(false)
  })

  it('sets export tab', () => {
    const { exportTab, setExportTab } = useExportPanel()
    setExportTab('download')
    expect(exportTab.value).toBe('download')
  })

  it('sets selected format', () => {
    const { selectedFormat, setSelectedFormat } = useExportPanel()
    setSelectedFormat('svg')
    expect(selectedFormat.value).toBe('svg')
  })

  it('resets to defaults', () => {
    const panel = useExportPanel()
    panel.setExportTab('download')
    panel.setSelectedFormat('bpc')
    panel.pngScale.value = 4
    panel.svgInlineFonts.value = true
    panel.reset()
    expect(panel.exportTab.value).toBe('embed')
    expect(panel.selectedFormat.value).toBe('png')
    expect(panel.pngScale.value).toBe(2)
    expect(panel.svgInlineFonts.value).toBe(false)
  })

  it('shares state across calls', () => {
    const a = useExportPanel()
    const b = useExportPanel()
    a.setExportTab('download')
    expect(b.exportTab.value).toBe('download')
  })
})
