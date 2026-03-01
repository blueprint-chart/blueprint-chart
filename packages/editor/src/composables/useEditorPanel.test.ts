import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorPanel } from './useEditorPanel'

describe('useEditorPanel', () => {
  beforeEach(() => {
    useEditorPanel().reset()
  })

  it('has correct defaults', () => {
    const { panelMode, activeTab, viewMode, dataView, dataPanelMode, dataPanelTab, dataPanelOpen, selectedColumnIndex, floatingPosition, floatingSize, dataFloatingPosition } = useEditorPanel()
    expect(panelMode.value).toBe('docked')
    expect(activeTab.value).toBe('type')
    expect(viewMode.value).toBe('preview')
    expect(dataView.value).toBe('upload')
    expect(dataPanelMode.value).toBe('docked')
    expect(dataPanelTab.value).toBe('')
    expect(dataPanelOpen.value).toBe(false)
    expect(selectedColumnIndex.value).toBe(-1)
    expect(floatingPosition.value).toEqual({ x: -1, y: 16 })
    expect(floatingSize.value).toEqual({ width: 340, height: 500 })
    expect(dataFloatingPosition.value).toEqual({ x: -1, y: 16 })
  })

  it('dock() sets panelMode to docked', () => {
    const { panelMode, float, dock } = useEditorPanel()
    float()
    expect(panelMode.value).toBe('floating')
    dock()
    expect(panelMode.value).toBe('docked')
  })

  it('float() sets panelMode to floating', () => {
    const { panelMode, float } = useEditorPanel()
    float()
    expect(panelMode.value).toBe('floating')
  })

  it('collapse() sets panelMode to collapsed and clears activeTab', () => {
    const { panelMode, activeTab, collapse } = useEditorPanel()
    collapse()
    expect(panelMode.value).toBe('collapsed')
    expect(activeTab.value).toBe('')
  })

  it('toggleMode cycles docked → floating → docked', () => {
    const { panelMode, toggleMode } = useEditorPanel()
    expect(panelMode.value).toBe('docked')
    toggleMode()
    expect(panelMode.value).toBe('floating')
    toggleMode()
    expect(panelMode.value).toBe('docked')
  })

  it('toggleMode from collapsed restores last open mode', () => {
    const { panelMode, collapse, float, toggleMode } = useEditorPanel()
    collapse()
    toggleMode()
    expect(panelMode.value).toBe('docked')

    float()
    collapse()
    toggleMode()
    expect(panelMode.value).toBe('floating')
  })

  it('selectTab updates activeTab', () => {
    const { activeTab, selectTab } = useEditorPanel()
    selectTab('appearance')
    expect(activeTab.value).toBe('appearance')
  })

  it('selectTab opens panel when collapsed (restores last open mode)', () => {
    const { panelMode, activeTab, collapse, selectTab } = useEditorPanel()
    collapse()
    expect(panelMode.value).toBe('collapsed')
    selectTab('text')
    expect(panelMode.value).toBe('docked')
    expect(activeTab.value).toBe('text')
  })

  it('selectTab restores floating mode when collapsed from floating', () => {
    const { panelMode, activeTab, float, collapse, selectTab } = useEditorPanel()
    float()
    collapse()
    expect(panelMode.value).toBe('collapsed')
    selectTab('appearance')
    expect(panelMode.value).toBe('floating')
    expect(activeTab.value).toBe('appearance')
  })

  it('selectTab does not change mode when docked', () => {
    const { panelMode, selectTab } = useEditorPanel()
    selectTab('series')
    expect(panelMode.value).toBe('docked')
  })

  it('selectTab does not change mode when floating', () => {
    const { panelMode, float, selectTab } = useEditorPanel()
    float()
    selectTab('axes')
    expect(panelMode.value).toBe('floating')
  })

  it('setViewMode updates viewMode', () => {
    const { viewMode, setViewMode } = useEditorPanel()
    setViewMode('dsl')
    expect(viewMode.value).toBe('dsl')
    setViewMode('preview')
    expect(viewMode.value).toBe('preview')
  })

  it('setDataView updates dataView', () => {
    const { dataView, setDataView } = useEditorPanel()
    setDataView('structure')
    expect(dataView.value).toBe('structure')
    setDataView('upload')
    expect(dataView.value).toBe('upload')
  })

  it('setDataView to structure auto-opens panel to column tab', () => {
    const { dataPanelOpen, dataPanelTab, selectedColumnIndex, setDataView } = useEditorPanel()
    setDataView('structure')
    expect(dataPanelOpen.value).toBe(true)
    expect(dataPanelTab.value).toBe('column')
    expect(selectedColumnIndex.value).toBe(-1)
  })

  it('dockDataPanel sets dataPanelMode to docked', () => {
    const { dataPanelMode, floatDataPanel, dockDataPanel } = useEditorPanel()
    floatDataPanel()
    expect(dataPanelMode.value).toBe('floating')
    dockDataPanel()
    expect(dataPanelMode.value).toBe('docked')
  })

  it('floatDataPanel sets dataPanelMode to floating', () => {
    const { dataPanelMode, floatDataPanel } = useEditorPanel()
    floatDataPanel()
    expect(dataPanelMode.value).toBe('floating')
  })

  it('collapseDataPanel sets dataPanelMode to collapsed', () => {
    const { dataPanelMode, collapseDataPanel } = useEditorPanel()
    collapseDataPanel()
    expect(dataPanelMode.value).toBe('collapsed')
  })

  it('openDataPanel restores dataPanelMode from collapsed', () => {
    const { dataPanelMode, collapseDataPanel, openDataPanel } = useEditorPanel()
    collapseDataPanel()
    expect(dataPanelMode.value).toBe('collapsed')
    openDataPanel('column')
    expect(dataPanelMode.value).toBe('docked')
  })

  it('openDataPanel restores floating mode when collapsed from floating', () => {
    const { dataPanelMode, floatDataPanel, collapseDataPanel, openDataPanel } = useEditorPanel()
    floatDataPanel()
    collapseDataPanel()
    expect(dataPanelMode.value).toBe('collapsed')
    openDataPanel('column')
    expect(dataPanelMode.value).toBe('floating')
  })

  it('closeDataPanel sets dataPanelMode to collapsed', () => {
    const { dataPanelMode, openDataPanel, closeDataPanel } = useEditorPanel()
    openDataPanel('column')
    closeDataPanel()
    expect(dataPanelMode.value).toBe('collapsed')
  })

  it('openDataPanel sets tab and opens panel', () => {
    const { dataPanelTab, dataPanelOpen, openDataPanel } = useEditorPanel()
    openDataPanel('transforms')
    expect(dataPanelTab.value).toBe('transforms')
    expect(dataPanelOpen.value).toBe(true)
  })

  it('closeDataPanel closes the panel', () => {
    const { dataPanelOpen, openDataPanel, closeDataPanel } = useEditorPanel()
    openDataPanel('column')
    closeDataPanel()
    expect(dataPanelOpen.value).toBe(false)
  })

  it('toggleDataPanel toggles open state', () => {
    const { dataPanelOpen, toggleDataPanel } = useEditorPanel()
    expect(dataPanelOpen.value).toBe(false)
    toggleDataPanel()
    expect(dataPanelOpen.value).toBe(true)
    toggleDataPanel()
    expect(dataPanelOpen.value).toBe(false)
  })

  it('selectColumn sets index and opens column panel', () => {
    const { selectedColumnIndex, dataPanelTab, dataPanelOpen, selectColumn } = useEditorPanel()
    selectColumn(2)
    expect(selectedColumnIndex.value).toBe(2)
    expect(dataPanelTab.value).toBe('column')
    expect(dataPanelOpen.value).toBe(true)
  })

  it('selectColumn deselects when clicking the same column again', () => {
    const { selectedColumnIndex, dataPanelOpen, openDataPanel, selectColumn } = useEditorPanel()
    openDataPanel('column')
    selectColumn(2)
    expect(selectedColumnIndex.value).toBe(2)
    expect(dataPanelOpen.value).toBe(true)
    selectColumn(2)
    expect(selectedColumnIndex.value).toBe(-1)
    expect(dataPanelOpen.value).toBe(true)
  })

  it('setDataPanelTab changes tab without opening', () => {
    const { dataPanelTab, dataPanelOpen, setDataPanelTab } = useEditorPanel()
    setDataPanelTab('reco')
    expect(dataPanelTab.value).toBe('reco')
    expect(dataPanelOpen.value).toBe(false)
  })

  it('reset restores all defaults', () => {
    const panel = useEditorPanel()
    panel.float()
    panel.selectTab('axes')
    panel.setViewMode('dsl')
    panel.setDataView('structure')
    panel.openDataPanel('transforms')
    panel.floatDataPanel()
    panel.selectColumn(3)
    panel.floatingPosition.value = { x: 100, y: 200 }
    panel.dataFloatingPosition.value = { x: 50, y: 100 }
    panel.reset()
    expect(panel.panelMode.value).toBe('docked')
    expect(panel.activeTab.value).toBe('type')
    expect(panel.viewMode.value).toBe('preview')
    expect(panel.dataView.value).toBe('upload')
    expect(panel.dataPanelMode.value).toBe('docked')
    expect(panel.dataPanelTab.value).toBe('')
    expect(panel.dataPanelOpen.value).toBe(false)
    expect(panel.selectedColumnIndex.value).toBe(-1)
    expect(panel.floatingPosition.value).toEqual({ x: -1, y: 16 })
    expect(panel.dataFloatingPosition.value).toEqual({ x: -1, y: 16 })
  })

  it('is a singleton across calls', () => {
    const a = useEditorPanel()
    const b = useEditorPanel()
    a.selectTab('annotate')
    expect(b.activeTab.value).toBe('annotate')
  })
})
