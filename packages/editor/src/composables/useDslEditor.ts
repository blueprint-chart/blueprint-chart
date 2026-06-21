import { onMounted, onUnmounted, shallowRef, watch, type Ref, type TemplateRef } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { bracketMatching, indentOnInput, indentUnit } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { lintGutter, linter, forceLinting } from '@codemirror/lint'
import { bpcLanguage, bpcHighlighter, bpcEditorTheme } from '@/dsl-lang'
import { buildDiagnostics } from '@/dsl-lang/diagnostics'
import { createDslSync, type DslSyncController } from '@/composables/dslSync'
import { useDslOutput } from '@/composables/useDslOutput'
import { useDslSync } from '@/composables/useDslSync'
import { diffEdit } from '@/utils/dsl/diff'
import { computePurge } from '@/utils/dsl/purge'
import '@/dsl-lang/highlight.scss'

const DEBOUNCE_MS = 200

export function useDslEditor(editorEl: TemplateRef<HTMLElement>): { purge: () => void, canPurge: Ref<boolean> } {
  const { dsl, generateDsl, compact } = useDslOutput()
  // Generate compact canonical: emit only what the user meaningfully set, not
  // every ensureDefaults-backfilled option. Otherwise the seed and the
  // blur-time snap re-expand the chart, and deleting a default-valued line
  // would reappear ("previous value restored").
  compact.value = true
  const { applyDsl } = useDslSync()

  const canPurge = shallowRef(false)

  function recomputeCanPurge(text: string): void {
    canPurge.value = computePurge(text).canPurge
  }

  function purge(): void {
    if (!view) {
      return
    }
    const text = view.state.doc.toString()
    const { text: next } = computePurge(text)
    if (next === null) {
      return
    }
    const edit = diffEdit(text, next)
    if (!edit) {
      return
    }
    // Dispatching fires the updateListener docChanged path, which re-syncs the
    // stores and recomputes canPurge.
    view.dispatch({ changes: edit })
  }

  let view: EditorView | undefined
  let controller: DslSyncController | undefined

  // Single reusable debounce timer (via @vueuse useTimeoutFn) instead of a
  // hand-rolled setTimeout. It auto-stops on scope dispose, and we stop it
  // explicitly on unmount so an in-flight parse can't mutate the stores after
  // the editor is gone.
  let pendingParse: (() => void) | null = null
  const { start: startDebounce, stop: stopDebounce } = useTimeoutFn(() => {
    const fn = pendingParse
    pendingParse = null
    fn?.()
  }, DEBOUNCE_MS, { immediate: false })

  const dslLinter = linter(v => (controller ? buildDiagnostics(controller.lastParse, v.state.doc) : []))

  onMounted(() => {
    controller = createDslSync({
      applyDsl,
      getCanonicalDsl: () => generateDsl(),
      getDocText: () => view?.state.doc.toString() ?? '',
      patchDoc: edit => view?.dispatch({ changes: edit }),
      setDiagnostics: () => {
        if (view) {
          forceLinting(view)
        }
      },
      schedule: (fn) => {
        pendingParse = fn
        startDebounce()
        return () => stopDebounce()
      },
    })

    const state = EditorState.create({
      doc: dsl.value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        closeBrackets(),
        indentOnInput(),
        indentUnit.of('  '),
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap]),
        bpcLanguage(),
        bpcHighlighter,
        lintGutter(),
        dslLinter,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const text = update.state.doc.toString()
            controller?.onDocChanged(text)
            recomputeCanPurge(text)
          }
          if (update.focusChanged) {
            if (update.view.hasFocus) {
              controller?.onFocus()
            }
            else {
              controller?.onBlur()
            }
          }
        }),
        bpcEditorTheme,
      ],
    })

    view = new EditorView({ state, parent: editorEl.value! })
    recomputeCanPurge(dsl.value)
  })

  watch(dsl, (newVal: string) => {
    controller?.onExternalDsl(newVal)
    recomputeCanPurge(newVal)
  })

  onUnmounted(() => {
    controller?.cancel()
    stopDebounce()
    view?.destroy()
    view = undefined
    controller = undefined
  })

  return { purge, canPurge }
}
