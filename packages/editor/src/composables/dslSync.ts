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
  /** Refresh lint state from the controller's latest parse result. */
  setDiagnostics: () => void
  /** Schedule a debounced run; returns a cancel function. */
  schedule: (fn: () => void) => () => void
}

export interface DslSyncController {
  onDocChanged: (text: string) => void
  onFocus: () => void
  onBlur: () => void
  onExternalDsl: (newDsl: string) => void
  /** Cancel any pending debounced parse (e.g. on teardown). */
  cancel: () => void
  readonly lastParse: DslApplyResult
}

// True when the text contains a line comment or a block-comment opener.
// A `//` only counts when it begins a line (after trimming) so that `//`
// inside a quoted value (e.g. a sourceUrl) is not misread; a `/*` opener
// counts anywhere.
function hasComments(text: string): boolean {
  return text.split('\n').some((line) => {
    const trimmed = line.trim()
    return trimmed.startsWith('//') || line.includes('/*')
  })
}

export function createDslSync(effects: DslSyncEffects): DslSyncController {
  let isFocused = false
  let updatingFromExternal = false
  // Whether the user has edited the document since focusing — decides who wins
  // when an external change arrives mid-focus.
  let dirty = false
  // Latest external DSL that arrived while focused (suppressed at the time);
  // applied on blur if the user made no edits, so it isn't silently dropped.
  let pendingExternal: string | null = null
  let lastParse: DslApplyResult = { success: true }
  let cancelPending: (() => void) | null = null

  function runParse(text: string): void {
    lastParse = effects.applyDsl(text)
    effects.setDiagnostics()
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
    dirty = true
    cancelPending?.()
    cancelPending = effects.schedule(() => {
      cancelPending = null
      runParse(text)
    })
  }

  function onFocus(): void {
    isFocused = true
    dirty = false
    pendingExternal = null
  }

  function onBlur(): void {
    isFocused = false
    if (cancelPending) {
      cancelPending()
      cancelPending = null
      runParse(effects.getDocText())
    }

    const buffered = pendingExternal
    pendingExternal = null

    // User focused but never edited, and an external change arrived meanwhile:
    // apply it rather than discarding it or overwriting it with a stale snap.
    if (!dirty && buffered !== null) {
      writeExternal(buffered)
      return
    }

    // Snap to canonical only when the last parse succeeded, and never when the
    // document contains comments — canonical generation drops them, so snapping
    // would destroy user-authored comments.
    if (lastParse.success && !hasComments(effects.getDocText())) {
      writeExternal(effects.getCanonicalDsl())
    }
  }

  function onExternalDsl(newDsl: string): void {
    if (isFocused) {
      // Buffer the latest external value; onBlur applies it if the user didn't
      // edit. Dropping it here would lose concurrent changes (e.g. cloud sync).
      pendingExternal = newDsl
      return
    }
    writeExternal(newDsl)
  }

  function cancel(): void {
    cancelPending?.()
    cancelPending = null
  }

  return {
    onDocChanged,
    onFocus,
    onBlur,
    onExternalDsl,
    cancel,
    get lastParse() {
      return lastParse
    },
  }
}
