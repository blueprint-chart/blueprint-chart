<template>
  <div class="d-flex flex-column h-100">
    <div
      ref="editorEl"
      class="flex-grow-1 overflow-auto"
    />
    <div
      v-if="error"
      class="text-danger small mt-1"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { bpcLanguage, bpcHighlighter } from '@/dsl-lang'
import '@/dsl-lang/highlight.scss'

const { dsl } = useDslOutput()
const { applyDsl } = useDslSync()

const editorEl = useTemplateRef<HTMLElement>('editorEl')
const error = ref<string>()
let view: EditorView | undefined
let updatingFromExternal = false

function onEditorUpdate(update: { docChanged: boolean, state: EditorState }) {
  if (!update.docChanged || updatingFromExternal) {
    return
  }
  const value = update.state.doc.toString()
  const result = applyDsl(value)
  if (result.success) {
    error.value = undefined
  }
  else {
    error.value = result.error
  }
}

onMounted(() => {
  const state = EditorState.create({
    doc: dsl.value,
    extensions: [
      keymap.of([...defaultKeymap, ...historyKeymap]),
      history(),
      bpcLanguage(),
      bpcHighlighter,
      EditorView.updateListener.of(onEditorUpdate),
      EditorView.theme({
        '&': { height: '100%', backgroundColor: 'var(--bs-body-bg)', borderRadius: 'var(--bs-border-radius)' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': { fontFamily: 'var(--bs-font-monospace)' },
        '.cm-gutters': {
          backgroundColor: 'var(--bs-body-bg)',
          color: 'var(--bs-secondary-color)',
          borderRight: '1px solid var(--bs-border-color)',
        },
      }),
    ],
  })
  view = new EditorView({ state, parent: editorEl.value! })
})

watch(dsl, (newVal) => {
  if (!view) {
    return
  }
  const current = view.state.doc.toString()
  if (current === newVal) {
    return
  }
  updatingFromExternal = true
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: newVal },
  })
  updatingFromExternal = false
})

onUnmounted(() => {
  view?.destroy()
  view = undefined
})
</script>
