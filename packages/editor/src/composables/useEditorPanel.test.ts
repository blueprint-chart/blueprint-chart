import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorPanel } from './useEditorPanel'

beforeEach(() => {
  useEditorPanel().reset()
})

describe('useEditorPanel defaults', () => {
  it('has correct defaults', () => {
    const { panelMode, activeTab, viewMode, floatingPosition, floatingSize } = useEditorPanel()
    expect(panelMode.value).toBe('docked')
    expect(activeTab.value).toBe('type')
    expect(viewMode.value).toBe('preview')
    expect(floatingPosition.value).toEqual({ x: -1, y: 16 })
    expect(floatingSize.value).toEqual({ width: 340, height: 500 })
  })
})

describe('useEditorPanel dock and float', () => {
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
})

describe('useEditorPanel toggleMode', () => {
  it('cycles docked -> floating -> docked', () => {
    const { panelMode, toggleMode } = useEditorPanel()
    expect(panelMode.value).toBe('docked')
    toggleMode()
    expect(panelMode.value).toBe('floating')
    toggleMode()
    expect(panelMode.value).toBe('docked')
  })

  it('from collapsed restores last open mode', () => {
    const { panelMode, collapse, float, toggleMode } = useEditorPanel()
    collapse()
    toggleMode()
    expect(panelMode.value).toBe('docked')
    float()
    collapse()
    toggleMode()
    expect(panelMode.value).toBe('floating')
  })
})

describe('useEditorPanel selectTab basics', () => {
  it('updates activeTab', () => {
    const { activeTab, selectTab } = useEditorPanel()
    selectTab('appearance')
    expect(activeTab.value).toBe('appearance')
  })

  it('opens panel when collapsed', () => {
    const { panelMode, activeTab, collapse, selectTab } = useEditorPanel()
    collapse()
    expect(panelMode.value).toBe('collapsed')
    selectTab('text')
    expect(panelMode.value).toBe('docked')
    expect(activeTab.value).toBe('text')
  })

  it('restores floating mode when collapsed from floating', () => {
    const { panelMode, activeTab, float, collapse, selectTab } = useEditorPanel()
    float()
    collapse()
    selectTab('appearance')
    expect(panelMode.value).toBe('floating')
    expect(activeTab.value).toBe('appearance')
  })
})

describe('useEditorPanel selectTab mode preservation', () => {
  it('does not change mode when docked', () => {
    const { panelMode, selectTab } = useEditorPanel()
    selectTab('series')
    expect(panelMode.value).toBe('docked')
  })

  it('does not change mode when floating', () => {
    const { panelMode, float, selectTab } = useEditorPanel()
    float()
    selectTab('axes')
    expect(panelMode.value).toBe('floating')
  })
})

describe('useEditorPanel viewMode', () => {
  it('setViewMode updates viewMode', () => {
    const { viewMode, setViewMode } = useEditorPanel()
    setViewMode('dsl')
    expect(viewMode.value).toBe('dsl')
    setViewMode('preview')
    expect(viewMode.value).toBe('preview')
  })
})

describe('useEditorPanel reset', () => {
  it('reset restores all defaults', () => {
    const panel = useEditorPanel()
    panel.float()
    panel.selectTab('axes')
    panel.setViewMode('dsl')
    panel.floatingPosition.value = { x: 100, y: 200 }
    panel.reset()
    expect(panel.panelMode.value).toBe('docked')
    expect(panel.activeTab.value).toBe('type')
    expect(panel.viewMode.value).toBe('preview')
    expect(panel.floatingPosition.value).toEqual({ x: -1, y: 16 })
  })

  it('is a singleton across calls', () => {
    const a = useEditorPanel()
    const b = useEditorPanel()
    a.selectTab('annotate')
    expect(b.activeTab.value).toBe('annotate')
  })
})
