import { useEditorPanelStore as useEditorPanel } from './editorPanel'

describe('useEditorPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has correct defaults', () => {
    const store = useEditorPanel()
    expect(store.activeTab).toBe('type')
    expect(store.viewMode).toBe('preview')
    expect(store.canvasMode).toBe('blueprint')
    expect(store.showDimensions).toBe(true)
    expect(store.pendingAnnotationIndex).toBeNull()
    expect(store.dataView).toBe('upload')
    expect(store.dataPanelTab).toBe('')
    expect(store.dataPanelOpen).toBe(false)
    expect(store.selectedColumnIndex).toBe(-1)
  })

  it('selectTab updates activeTab', () => {
    const store = useEditorPanel()
    store.selectTab('style')
    expect(store.activeTab).toBe('style')
  })

  it('selectAnnotation sets pendingAnnotationIndex and switches to annotate tab', () => {
    const store = useEditorPanel()
    store.selectAnnotation(3)
    expect(store.pendingAnnotationIndex).toBe(3)
    expect(store.activeTab).toBe('annotate')
  })

  it('selectAnnotation accepts a string id', () => {
    const store = useEditorPanel()
    store.selectAnnotation('ann-xyz')
    expect(store.pendingAnnotationIndex).toBe('ann-xyz')
    expect(store.activeTab).toBe('annotate')
  })

  it('setViewMode updates viewMode', () => {
    const store = useEditorPanel()
    store.setViewMode('dsl')
    expect(store.viewMode).toBe('dsl')
    store.setViewMode('preview')
    expect(store.viewMode).toBe('preview')
  })

  it('setCanvasMode updates canvasMode', () => {
    const store = useEditorPanel()
    store.setCanvasMode('dark')
    expect(store.canvasMode).toBe('dark')
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

  it('openDataPanel sets tab and opens panel', () => {
    const store = useEditorPanel()
    store.openDataPanel('transforms')
    expect(store.dataPanelTab).toBe('transforms')
    expect(store.dataPanelOpen).toBe(true)
  })

  it('closeDataPanel closes the panel and clears the tab', () => {
    const store = useEditorPanel()
    store.openDataPanel('column')
    store.closeDataPanel()
    expect(store.dataPanelOpen).toBe(false)
    expect(store.dataPanelTab).toBe('')
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
    store.selectTab('axes')
    store.setViewMode('dsl')
    store.setCanvasMode('dark')
    store.showDimensions = false
    store.setDataView('structure')
    store.openDataPanel('transforms')
    store.selectColumn(3)
    store.reset()
    expect(store.activeTab).toBe('type')
    expect(store.viewMode).toBe('preview')
    expect(store.canvasMode).toBe('blueprint')
    expect(store.showDimensions).toBe(true)
    expect(store.pendingAnnotationIndex).toBeNull()
    expect(store.dataView).toBe('upload')
    expect(store.dataPanelTab).toBe('')
    expect(store.dataPanelOpen).toBe(false)
    expect(store.selectedColumnIndex).toBe(-1)
  })

  it('is a singleton across calls', () => {
    const a = useEditorPanel()
    const b = useEditorPanel()
    a.selectTab('annotate')
    expect(b.activeTab).toBe('annotate')
  })
})
