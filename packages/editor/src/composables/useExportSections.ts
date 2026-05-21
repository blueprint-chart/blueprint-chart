import type { Component } from 'vue'
import type { ExportTab } from '@/stores/exportPanel'
import IPhCode from '~icons/ph/code'
import IPhDownloadSimple from '~icons/ph/download-simple'

export interface ExportSection {
  key: ExportTab
  label: string
  icon: Component
  tooltip?: string
}

export function useExportSections() {
  const sections: ExportSection[] = [
    { key: 'embed', label: 'Embed', icon: IPhCode },
    { key: 'download', label: 'Download', icon: IPhDownloadSimple },
  ]
  return { sections }
}
