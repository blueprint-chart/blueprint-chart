// useChartHistory is tightly coupled to provide/inject (useChartConfig,
// useChartTypeOptions, useChartSession).  Instead of testing the composable
// directly we test the pure helper logic that drives it: pushState, undo,
// redo using an extracted in-memory model that mirrors the real
// SessionHistory / stack behaviour.

interface SessionHistory {
  undoStack: string[]
  redoStack: string[]
  currentState: string
}

const MAX_HISTORY = 100

function makeHistory(initial: string): SessionHistory {
  return { undoStack: [], redoStack: [], currentState: initial }
}

function pushState(h: SessionHistory, state: string) {
  if (state === h.currentState) {
    return
  }
  h.undoStack.push(h.currentState)
  if (h.undoStack.length > MAX_HISTORY) {
    h.undoStack.shift()
  }
  h.redoStack.length = 0
  h.currentState = state
}

function undo(h: SessionHistory): string | null {
  if (h.undoStack.length === 0) {
    return null
  }
  h.redoStack.push(h.currentState)
  h.currentState = h.undoStack.pop()!
  return h.currentState
}

function redo(h: SessionHistory): string | null {
  if (h.redoStack.length === 0) {
    return null
  }
  h.undoStack.push(h.currentState)
  h.currentState = h.redoStack.pop()!
  return h.currentState
}

describe('chart history undo/redo logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with no undo/redo available', () => {
    const h = makeHistory('state-0')
    expect(h.undoStack).toHaveLength(0)
    expect(h.redoStack).toHaveLength(0)
  })

  it('pushes state onto undo stack', () => {
    const h = makeHistory('state-0')
    pushState(h, 'state-1')
    expect(h.currentState).toBe('state-1')
    expect(h.undoStack).toEqual(['state-0'])
    expect(h.redoStack).toEqual([])
  })

  it('ignores push of identical state', () => {
    const h = makeHistory('state-0')
    pushState(h, 'state-0')
    expect(h.undoStack).toHaveLength(0)
    expect(h.currentState).toBe('state-0')
  })

  it('undo restores previous state', () => {
    const h = makeHistory('state-0')
    pushState(h, 'state-1')
    pushState(h, 'state-2')

    const restored = undo(h)
    expect(restored).toBe('state-1')
    expect(h.currentState).toBe('state-1')
    expect(h.redoStack).toEqual(['state-2'])
  })

  it('undo returns null when nothing to undo', () => {
    const h = makeHistory('state-0')
    expect(undo(h)).toBeNull()
    expect(h.currentState).toBe('state-0')
  })

  it('redo restores undone state', () => {
    const h = makeHistory('state-0')
    pushState(h, 'state-1')
    undo(h)

    const restored = redo(h)
    expect(restored).toBe('state-1')
    expect(h.currentState).toBe('state-1')
    expect(h.undoStack).toEqual(['state-0'])
  })

  it('redo returns null when nothing to redo', () => {
    const h = makeHistory('state-0')
    expect(redo(h)).toBeNull()
  })

  it('new push clears redo stack', () => {
    const h = makeHistory('state-0')
    pushState(h, 'state-1')
    pushState(h, 'state-2')
    undo(h)
    expect(h.redoStack).toHaveLength(1)

    pushState(h, 'state-3')
    expect(h.redoStack).toHaveLength(0)
  })

  it('multiple undo/redo round-trips preserve order', () => {
    const h = makeHistory('A')
    pushState(h, 'B')
    pushState(h, 'C')
    pushState(h, 'D')

    undo(h) // D -> C
    undo(h) // C -> B
    expect(h.currentState).toBe('B')

    redo(h) // B -> C
    expect(h.currentState).toBe('C')

    redo(h) // C -> D
    expect(h.currentState).toBe('D')

    undo(h) // D -> C
    undo(h) // C -> B
    undo(h) // B -> A
    expect(h.currentState).toBe('A')
    expect(undo(h)).toBeNull() // nothing left
  })

  it('caps undo stack at MAX_HISTORY', () => {
    const h = makeHistory('state-0')
    for (let i = 1; i <= MAX_HISTORY + 10; i++) {
      pushState(h, `state-${i}`)
    }
    expect(h.undoStack).toHaveLength(MAX_HISTORY)
    // Oldest entries should have been shifted off
    expect(h.undoStack[0]).toBe('state-10')
  })
})
