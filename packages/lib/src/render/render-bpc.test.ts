import { describe, it, expect, beforeEach } from 'vitest'
import { renderBpc } from './render-bpc'

describe('renderBpc', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('renders a minimal BPC string', () => {
    renderBpc(container, `chart bar-vertical {
  data {
    "a" = 1
    "b" = 2
  }
}`)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('does nothing when bpc is empty', () => {
    renderBpc(container, '')
    expect(container.querySelector('svg')).toBeNull()
  })

  it('honors sceneIndex', () => {
    renderBpc(container, `chart bar-vertical {
  data {
    "a" = 1
    "b" = 2
  }
  scene {
    type = line
  }
}`, { sceneIndex: 0 })
    // Rendering a line for a 2-point series should produce a path
    expect(container.querySelector('svg path')).not.toBeNull()
  })

  it('renders a visible error element on invalid DSL instead of throwing', () => {
    expect(() => renderBpc(container, 'not a chart at all {')).not.toThrow()
    expect(container.querySelector('svg')).toBeNull()
    expect(container.textContent).toContain('Blueprint Chart: could not parse chart')
    // The SyntaxError message (carrying line:column) should be surfaced too.
    expect(container.textContent).toMatch(/\d+:\d+/)
  })

  it('clears a prior valid render when given invalid DSL', () => {
    renderBpc(container, `chart bar-vertical {
  data {
    "a" = 1
    "b" = 2
  }
}`)
    expect(container.querySelector('svg')).not.toBeNull()
    renderBpc(container, 'broken {')
    expect(container.querySelector('svg')).toBeNull()
    expect(container.textContent).toContain('Blueprint Chart: could not parse chart')
  })

  it('leaves valid DSL unaffected (no error element)', () => {
    renderBpc(container, `chart bar-vertical {
  data {
    "a" = 1
    "b" = 2
  }
}`)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.textContent).not.toContain('could not parse chart')
  })
})
