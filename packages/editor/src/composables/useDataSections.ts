import type { Component } from 'vue'
import type { DataPanelTab } from '@/stores/editorPanel'
import IPhColumns from '~icons/ph/columns'
import IPhFlowArrow from '~icons/ph/flow-arrow'
import IPhFileText from '~icons/ph/file-text'
import IPhLightbulb from '~icons/ph/lightbulb'

export interface DataSection {
  key: DataPanelTab
  label: string
  icon: Component
  tooltip?: string
}

export function useDataSections() {
  const sections: DataSection[] = [
    { key: 'column', label: 'Columns', icon: IPhColumns },
    { key: 'transforms', label: 'Transforms', icon: IPhFlowArrow },
    { key: 'parsing', label: 'Parsing', icon: IPhFileText },
    { key: 'reco', label: 'Recommendations', icon: IPhLightbulb },
  ]
  return { sections }
}
