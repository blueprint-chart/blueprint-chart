import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEditorPanelStore as useEditorPanel } from './editorPanel'

describe('useEditorPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has correct defaults', () => {
    const store = useEditorPanel()
    expect(store.panelMode).toBe('docked')
    expect(store.activeTab).toBe('type')
    expect(store.viewMode).toBe('preview')
    expect(store.dataView).toBe('upload')
    expect(store.dataPanelMode).toBe('docked')
    expect(store.dataPanelTab).toBe('')
    expect(store.dataPanelOpen).toBe(false)
    expect(store.selectedColumnIndex).toBe(-1)
    expect(store.floatingPosition).toEqual({ x: -1, y: 16 })
    expect(store.floatingSize).toEqual({ width: 340, height: 500 })
    expect(store.dataFloatingPosition).toEqual({ x: -1, y: 16 })
    const expected = Math.min(660, Math.max(260, Math.floor(window.innerWidth * 0.35)))
    expect(store.dockedPanelWidth).toBe(expected)
  })

  it('dock() sets panelMode to docked', () => {
    const store = useEditorPanel()
    store.float()
    expect(store.panelMode).toBe('floating')
    store.dock()
    expect(store.panelMode).toBe('docked')
  })

  it('float() sets panelMode to floating', () => {
    const store = useEditorPanel()
    store.float()
    expect(store.panelMode).toBe('floating')
  })

  it('collapse() sets panelMode to collapsed and clears activeTab', () => {
    const store = useEditorPanel()
    store.collapse()
    expect(store.panelMode).toBe('collapsed')
    expect(store.activeTab).toBe('')
  })

  it('toggleMode cycles docked → floating → docked', () => {
    const store = useEditorPanel()
    expect(store.panelMode).toBe('docked')
    store.toggleMode()
    expect(store.panelMode).toBe('floating')
    store.toggleMode()
    expect(store.panelMode).toBe('docked')
  })

  it('toggleMode from collapsed restores last open mode', () => {
    const store = useEditorPanel()
    store.collapse()
    store.toggleMode()
    expect(store.panelMode).toBe('docked')

    store.float()
    store.collapse()
    store.toggleMode()
    expect(store.panelMode).toBe('floating')
  })

  it('selectTab updates activeTab', () => {
    const store = useEditorPanel()
    store.selectTab('style')
    expect(store.activeTab).toBe('style')
  })

  it('selectTab opens panel when collapsed (restores last open mode)', () => {
    const store = useEditorPanel()
    store.collapse()
    expect(store.panelMode).toBe('collapsed')
    store.selectTab('text')
    expect(store.panelMode).toBe('docked')
    expect(store.activeTab).toBe('text')
  })

  it('selectTab restores floating mode when collapsed from floating', () => {
    const store = useEditorPanel()
    store.float()
    store.collapse()
    expect(store.panelMode).toBe('collapsed')
    store.selectTab('style')
    expect(store.panelMode).toBe('floating')
    expect(store.activeTab).toBe('style')
  })

  it('selectTab does not change mode when docked', () => {
    const store = useEditorPanel()
    store.selectTab('series')
    expect(store.panelMode).toBe('docked')
  })

  it('selectTab does not change mode when floating', () => {
    const store = useEditorPanel()
    store.float()
    store.selectTab('axes')
    expect(store.panelMode).toBe('floating')
  })

  it('setViewMode updates viewMode', () => {
    const store = useEditorPanel()
    store.setViewMode('dsl')
    expect(store.viewMode).toBe('dsl')
    store.setViewMode('preview')
    expect(store.viewMode).toBe('preview')
  })

  it('setDataView updates dataView', () => {
    const store = useEditorPanel()
    store.setDataView('structure')
    expect(store.dataView).toBe('structure')
    store.setDataView('upload')
    expect(store.dataView).toBe('upload')
  })

  it('setDataView to structure auto-opens panel to column tab', () => {
    const store = useEditorPanel()
    store.setDataView('structure')
    expect(store.dataPanelOpen).toBe(true)
    expect(store.dataPanelTab).toBe('column')
    expect(store.selectedColumnIndex).toBe(-1)
  })

  it('dockDataPanel sets dataPanelMode to docked', () => {
    const store = useEditorPanel()
    store.floatDataPanel()
    expect(store.dataPanelMode).toBe('floating')
    store.dockDataPanel()
    expect(store.dataPanelMode).toBe('docked')
  })

  it('floatDataPanel sets dataPanelMode to floating', () => {
    const store = useEditorPanel()
    store.floatDataPanel()
    expect(store.dataPanelMode).toBe('floating')
  })

  it('collapseDataPanel sets dataPanelMode to collapsed', () => {
    const store = useEditorPanel()
    store.collapseDataPanel()
    expect(store.dataPanelMode).toBe('collapsed')
  })

  it('openDataPanel restores dataPanelMode from collapsed', () => {
    const store = useEditorPanel()
    store.collapseDataPanel()
    expect(store.dataPanelMode).toBe('collapsed')
    store.openDataPanel('column')
    expect(store.dataPanelMode).toBe('docked')
  })

  it('openDataPanel restores floating mode when collapsed from floating', () => {
    const store = useEditorPanel()
    store.floatDataPanel()
    store.collapseDataPanel()
    expect(store.dataPanelMode).toBe('collapsed')
    store.openDataPanel('column')
    expect(store.dataPanelMode).toBe('floating')
  })

  it('closeDataPanel sets dataPanelMode to collapsed', () => {
    const store = useEditorPanel()
    store.openDataPanel('column')
    store.closeDataPanel()
    expect(store.dataPanelMode).toBe('collapsed')
  })

  it('openDataPanel sets tab and opens panel', () => {
    const store = useEditorPanel()
    store.openDataPanel('transforms')
    expect(store.dataPanelTab).toBe('transforms')
    expect(store.dataPanelOpen).toBe(true)
  })

  it('closeDataPanel closes the panel', () => {
    const store = useEditorPanel()
    store.openDataPanel('column')
    store.closeDataPanel()
    expect(store.dataPanelOpen).toBe(false)
  })

  it('toggleDataPanel toggles open state', () => {
    const store = useEditorPanel()
    expect(store.dataPanelOpen).toBe(false)
    store.toggleDataPanel()
    expect(store.dataPanelOpen).toBe(true)
    store.toggleDataPanel()
    expect(store.dataPanelOpen).toBe(false)
  })

  it('selectColumn sets index and opens column panel', () => {
    const store = useEditorPanel()
    store.selectColumn(2)
    expect(store.selectedColumnIndex).toBe(2)
    expect(store.dataPanelTab).toBe('column')
    expect(store.dataPanelOpen).toBe(true)
  })

  it('selectColumn deselects when clicking the same column again', () => {
    const store = useEditorPanel()
    store.openDataPanel('column')
    store.selectColumn(2)
    expect(store.selectedColumnIndex).toBe(2)
    expect(store.dataPanelOpen).toBe(true)
    store.selectColumn(2)
    expect(store.selectedColumnIndex).toBe(-1)
    expect(store.dataPanelOpen).toBe(true)
  })

  it('setDataPanelTab changes tab without opening', () => {
    const store = useEditorPanel()
    store.setDataPanelTab('reco')
    expect(store.dataPanelTab).toBe('reco')
    expect(store.dataPanelOpen).toBe(false)
  })

  it('reset restores all defaults', () => {
    const store = useEditorPanel()
    store.float()
    store.selectTab('axes')
    store.setViewMode('dsl')
    store.setDataView('structure')
    store.openDataPanel('transforms')
    store.floatDataPanel()
    store.selectColumn(3)
    store.floatingPosition = { x: 100, y: 200 }
    store.dataFloatingPosition = { x: 50, y: 100 }
    store.dockedPanelWidth = 450
    store.reset()
    expect(store.panelMode).toBe('docked')
    expect(store.activeTab).toBe('type')
    expect(store.viewMode).toBe('preview')
    expect(store.dataView).toBe('upload')
    expect(store.dataPanelMode).toBe('docked')
    expect(store.dataPanelTab).toBe('')
    expect(store.dataPanelOpen).toBe(false)
    expect(store.selectedColumnIndex).toBe(-1)
    expect(store.floatingPosition).toEqual({ x: -1, y: 16 })
    expect(store.dataFloatingPosition).toEqual({ x: -1, y: 16 })
    const expectedWidth = Math.min(660, Math.max(260, Math.floor(window.innerWidth * 0.35)))
    expect(store.dockedPanelWidth).toBe(expectedWidth)
  })

  it('dockedPanelWidth is shared across calls', () => {
    const a = useEditorPanel()
    const b = useEditorPanel()
    a.dockedPanelWidth = 400
    expect(b.dockedPanelWidth).toBe(400)
  })

  it('is a singleton across calls', () => {
    const a = useEditorPanel()
    const b = useEditorPanel()
    a.selectTab('annotate')
    expect(b.activeTab).toBe('annotate')
  })
})
