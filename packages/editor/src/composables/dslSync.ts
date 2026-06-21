import { diffEdit } from '@/utils/dsl/diff'

export type { DslApplyResult } from '@/dsl-lang/diagnostics'
import type { DslApplyResult } from '@/dsl-lang/diagnostics'

export interface DslSyncEffects {
  /** Parse + apply DSL text to the stores. Never writes back to the editor. */
  applyDsl: (text: string) => DslApplyResult
  /** Freshly generated canonical DSL for the current store state. */
  getCanonicalDsl: () => string
  /** Current editor document text. */
  getDocText: () => string
  /** Apply a single-range edit to the editor document. */
  patchDoc: (edit: { from: number, to: number, insert: string }) => void
  /** Refresh lint state from `lastParse` (no-op argument; kept for clarity). */
  setDiagnostics: (result: DslApplyResult | null) => void
  /** Schedule a debounced run; returns a cancel function. */
  schedule: (fn: () => void) => () => void
}

export interface DslSyncController {
  onDocChanged: (text: string) => void
  onFocus: () => void
  onBlur: () => void
  onExternalDsl: (newDsl: string) => void
  readonly isFocused: boolean
  readonly lastParse: DslApplyResult
}

export function createDslSync(effects: DslSyncEffects): DslSyncController {
  let isFocused = false
  let updatingFromExternal = false
  let lastParse: DslApplyResult = { success: true }
  let cancelPending: (() => void) | null = null

  function runParse(text: string): void {
    lastParse = effects.applyDsl(text)
    effects.setDiagnostics(lastParse.success ? null : lastParse)
  }

  function writeExternal(newText: string): void {
    const edit = diffEdit(effects.getDocText(), newText)
    if (!edit) {
      return
    }
    updatingFromExternal = true
    try {
      effects.patchDoc(edit)
    }
    finally {
      updatingFromExternal = false
    }
  }

  function onDocChanged(text: string): void {
    if (updatingFromExternal) {
      return
    }
    cancelPending?.()
    cancelPending = effects.schedule(() => {
      cancelPending = null
      runParse(text)
    })
  }

  function onFocus(): void {
    isFocused = true
  }

  function onBlur(): void {
    isFocused = false
    if (cancelPending) {
      cancelPending()
      cancelPending = null
      runParse(effects.getDocText())
    }
    if (lastParse.success) {
      writeExternal(effects.getCanonicalDsl())
    }
  }

  function onExternalDsl(newDsl: string): void {
    if (isFocused) {
      return
    }
    writeExternal(newDsl)
  }

  return {
    onDocChanged,
    onFocus,
    onBlur,
    onExternalDsl,
    get isFocused() {
      return isFocused
    },
    get lastParse() {
      return lastParse
    },
  }
}
