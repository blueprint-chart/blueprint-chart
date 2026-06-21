import { onMounted, onUnmounted, watch, type TemplateRef } from 'vue'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { bracketMatching, indentOnInput, indentUnit } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { lintGutter, linter, forceLinting } from '@codemirror/lint'
import { bpcLanguage, bpcHighlighter } from '@/dsl-lang'
import { buildDiagnostics } from '@/dsl-lang/diagnostics'
import { createDslSync, type DslSyncController } from '@/composables/dslSync'
import { useDslOutput } from '@/composables/useDslOutput'
import { useDslSync } from '@/composables/useDslSync'
import '@/dsl-lang/highlight.scss'

const DEBOUNCE_MS = 200

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: 'var(--bc-tile-bg-elevated)',
    fontSize: '13px',
  },
  '.cm-scroller': { overflow: 'auto', lineHeight: '1.6' },
  // --fst-clearance is set by ChartEditPanel next to the floating scene
  // timeline; the fallback covers standalone use. Keep this hack.
  '.cm-content': {
    fontFamily: 'var(--bs-font-monospace)',
    paddingBottom: 'var(--fst-clearance, 9rem)',
    caretColor: 'var(--bs-body-color)',
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--bs-body-color)' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--bs-body-color) 4%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'color-mix(in srgb, var(--bs-body-color) 6%, transparent)' },
  '.cm-gutters': {
    backgroundColor: 'var(--bc-tile-bg-elevated)',
    color: 'var(--bs-secondary-color)',
    border: 'none',
  },
})

export function useDslEditor(editorEl: TemplateRef<HTMLElement>): void {
  const { dsl, generateDsl } = useDslOutput()
  const { applyDsl } = useDslSync()

  let view: EditorView | undefined
  let controller: DslSyncController | undefined

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
        const id = setTimeout(fn, DEBOUNCE_MS)
        return () => clearTimeout(id)
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
            controller?.onDocChanged(update.state.doc.toString())
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
        editorTheme,
      ],
    })

    view = new EditorView({ state, parent: editorEl.value! })
  })

  watch(dsl, (newVal: string) => {
    controller?.onExternalDsl(newVal)
  })

  onUnmounted(() => {
    view?.destroy()
    view = undefined
    controller = undefined
  })
}
