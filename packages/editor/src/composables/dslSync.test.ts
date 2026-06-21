import { describe, expect, it, vi } from 'vitest'
import { createDslSync, type DslApplyResult, type DslSyncEffects } from './dslSync'

interface Harness {
  doc: string
  applyDsl: ReturnType<typeof vi.fn>
  patchDoc: ReturnType<typeof vi.fn>
  setDiagnostics: ReturnType<typeof vi.fn>
  flush: () => void
  cancels: Array<ReturnType<typeof vi.fn>>
  effects: DslSyncEffects
}

function makeHarness(opts: { canonical?: string, parse?: (t: string) => DslApplyResult } = {}): Harness {
  const state = { doc: '' }
  const pending: Array<() => void> = []
  const cancels: Array<ReturnType<typeof vi.fn>> = []

  const applyDsl = vi.fn((t: string) => (opts.parse ? opts.parse(t) : { success: true } as DslApplyResult))
  const patchDoc = vi.fn((edit: { from: number, to: number, insert: string }) => {
    state.doc = state.doc.slice(0, edit.from) + edit.insert + state.doc.slice(edit.to)
  })
  const setDiagnostics = vi.fn()

  const effects: DslSyncEffects = {
    applyDsl,
    getCanonicalDsl: () => opts.canonical ?? state.doc,
    getDocText: () => state.doc,
    patchDoc,
    setDiagnostics,
    schedule: (fn) => {
      pending.push(fn)
      const cancel = vi.fn(() => {
        const i = pending.indexOf(fn)
        if (i >= 0) {
          pending.splice(i, 1)
        }
      })
      cancels.push(cancel)
      return cancel
    },
  }

  return {
    get doc() { return state.doc },
    set doc(v: string) { state.doc = v },
    applyDsl,
    patchDoc,
    setDiagnostics,
    flush: () => pending.splice(0).forEach(fn => fn()),
    cancels,
    effects,
  }
}

describe('createDslSync', () => {
  it('does not rewrite the document while typing (focused)', () => {
    const h = makeHarness()
    h.doc = 'chart bar {}'
    const c = createDslSync(h.effects)
    c.onFocus()
    c.onDocChanged('chart bar { ')
    h.flush()
    expect(h.applyDsl).toHaveBeenCalledWith('chart bar { ')
    expect(h.patchDoc).not.toHaveBeenCalled()
  })

  it('snaps to canonical on blur when the last parse succeeded', () => {
    const h = makeHarness({ canonical: 'chart bar {\n}\n' })
    h.doc = 'chart bar {   }'
    const c = createDslSync(h.effects)
    c.onFocus()
    c.onDocChanged('chart bar {   }')
    h.flush()
    c.onBlur()
    expect(h.patchDoc).toHaveBeenCalledTimes(1)
    expect(h.doc).toBe('chart bar {\n}\n')
  })

  it('leaves the text untouched on blur when the last parse failed', () => {
    const h = makeHarness({ parse: () => ({ success: false, error: 'bad' }) })
    h.doc = 'chart bar { '
    const c = createDslSync(h.effects)
    c.onFocus()
    c.onDocChanged('chart bar { ')
    h.flush()
    c.onBlur()
    expect(h.patchDoc).not.toHaveBeenCalled()
    expect(c.lastParse.success).toBe(false)
  })

  it('patches via minimal diff on an external change while unfocused', () => {
    const h = makeHarness()
    h.doc = 'chart bar {\n  title = "A"\n}\n'
    const c = createDslSync(h.effects)
    c.onExternalDsl('chart bar {\n  title = "B"\n}\n')
    expect(h.patchDoc).toHaveBeenCalledTimes(1)
    expect(h.doc).toBe('chart bar {\n  title = "B"\n}\n')
  })

  it('suppresses external changes while focused', () => {
    const h = makeHarness()
    h.doc = 'chart bar {}'
    const c = createDslSync(h.effects)
    c.onFocus()
    c.onExternalDsl('chart line {}')
    expect(h.patchDoc).not.toHaveBeenCalled()
  })

  it('does not re-parse when an external write echoes back as a doc change', () => {
    const state = { doc: 'chart bar {}' }
    const applyDsl = vi.fn(() => ({ success: true }) as DslApplyResult)
    const holder: { c?: ReturnType<typeof createDslSync> } = {}
    const effects: DslSyncEffects = {
      applyDsl,
      getCanonicalDsl: () => state.doc,
      getDocText: () => state.doc,
      patchDoc: (edit) => {
        state.doc = state.doc.slice(0, edit.from) + edit.insert + state.doc.slice(edit.to)
        // Mimic CodeMirror firing the update listener synchronously on dispatch.
        holder.c!.onDocChanged(state.doc)
      },
      setDiagnostics: vi.fn(),
      schedule: (fn) => {
        fn()
        return vi.fn()
      },
    }
    holder.c = createDslSync(effects)
    const c = holder.c
    c.onExternalDsl('chart line {}')
    expect(applyDsl).not.toHaveBeenCalled()
  })

  it('coalesces a burst of edits into a single parse', () => {
    const h = makeHarness()
    const c = createDslSync(h.effects)
    c.onFocus()
    c.onDocChanged('a')
    c.onDocChanged('ab')
    c.onDocChanged('abc')
    expect(h.cancels[0]).toHaveBeenCalled()
    expect(h.cancels[1]).toHaveBeenCalled()
    expect(h.cancels[2]).not.toHaveBeenCalled()
    h.flush()
    expect(h.applyDsl).toHaveBeenCalledTimes(1)
    expect(h.applyDsl).toHaveBeenCalledWith('abc')
  })

  it('flushes a pending parse against the latest text on blur', () => {
    const h = makeHarness()
    h.doc = 'chart bar {}'
    const c = createDslSync(h.effects)
    c.onFocus()
    c.onDocChanged('chart bar {}')
    // intentionally do NOT flush; blur must flush the pending parse
    c.onBlur()
    expect(h.applyDsl).toHaveBeenCalledWith('chart bar {}')
  })

  it('applies a buffered external change on blur when the user did not edit', () => {
    const h = makeHarness()
    h.doc = 'chart bar {}'
    const c = createDslSync(h.effects)
    c.onFocus()
    // External change arrives while focused (e.g. cloud sync) — suppressed now.
    c.onExternalDsl('chart line {}')
    expect(h.patchDoc).not.toHaveBeenCalled()
    // User blurs without having typed: the buffered change is applied, not lost.
    c.onBlur()
    expect(h.doc).toBe('chart line {}')
  })

  it('lets the user edit win over a buffered external change on blur', () => {
    const h = makeHarness({ canonical: 'chart bar {\n  title = "mine"\n}\n' })
    h.doc = 'chart bar {}'
    const c = createDslSync(h.effects)
    c.onFocus()
    c.onDocChanged('chart bar { title = "mine" }') // dirty
    h.flush()
    c.onExternalDsl('chart line {}') // external arrives while focused
    c.onBlur()
    // The user's edit (snapped to canonical) wins; the buffered external is dropped.
    expect(h.doc).toBe('chart bar {\n  title = "mine"\n}\n')
  })

  it('does not snap to canonical on blur when the document contains comments', () => {
    const h = makeHarness({ canonical: 'chart bar {\n  title = "x"\n}\n' })
    h.doc = 'chart bar {\n  // keep me\n  title = "x"\n}\n'
    const c = createDslSync(h.effects)
    c.onFocus()
    c.onDocChanged(h.doc) // valid parse
    h.flush()
    c.onBlur()
    // Comments would be lost by canonical regeneration, so the text is left as-is.
    expect(h.patchDoc).not.toHaveBeenCalled()
    expect(h.doc).toContain('// keep me')
  })

  it('cancel() stops a pending parse so it never runs', () => {
    const h = makeHarness()
    const c = createDslSync(h.effects)
    c.onFocus()
    c.onDocChanged('chart bar {}')
    c.cancel()
    expect(h.cancels[0]).toHaveBeenCalled()
    h.flush()
    expect(h.applyDsl).not.toHaveBeenCalled()
  })
})
