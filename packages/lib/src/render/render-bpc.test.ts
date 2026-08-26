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

  it('gives a type-switching scene its own axis label defaults', () => {
    renderBpc(container, `chart bar-vertical {
  data {
    "a" = 10
    "b" = 20
  }
  scene {
    type = line
  }
}`, { sceneIndex: 0 })
    // line defaults verticalLabelPosition to auto, bar-vertical to off
    expect(container.querySelectorAll('.bc-axis-vertical .tick text').length).toBeGreaterThan(0)
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

describe('renderBpc canvas background', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  const SRC = (extra = '') => `chart bar-vertical {
  title = "Bg test"${extra}
  data {
    "a" = 1
    "b" = 2
  }
}`

  it('inserts a background rect as the first rendered SVG child by default', () => {
    renderBpc(container, SRC())
    const svg = container.querySelector('.bc-frame-body svg')!
    const bg = svg.querySelector('.bc-canvas-bg')
    expect(bg).not.toBeNull()
    // <title>/<desc> precede it and paint nothing, so compare against the
    // first child that actually renders.
    const rendered = Array.from(svg.children).filter(el => el.tagName !== 'title' && el.tagName !== 'desc')
    expect(rendered[0]).toBe(bg)
    expect(bg!.getAttribute('fill')).toBeTruthy()
  })

  it('omits the background rect when transparentBackground = true', () => {
    renderBpc(container, SRC('\n  transparentBackground = true'))
    const svg = container.querySelector('.bc-frame-body svg')!
    expect(svg.querySelector('.bc-canvas-bg')).toBeNull()
  })

  it('keeps the background when transparentBackground = false', () => {
    renderBpc(container, SRC('\n  transparentBackground = false'))
    const svg = container.querySelector('.bc-frame-body svg')!
    expect(svg.querySelector('.bc-canvas-bg')).not.toBeNull()
  })

  it('does not add a background rect in frameless thumbnail mode', () => {
    renderBpc(container, SRC(), { thumbnail: true })
    const svg = container.querySelector('svg')!
    expect(svg.querySelector('.bc-canvas-bg')).toBeNull()
  })
})
