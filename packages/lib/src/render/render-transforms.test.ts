import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderBpc } from './render-bpc'
import { __resetTransformWarnings } from './ast-to-definition'

function categoryLabels(container: HTMLElement): (string | null)[] {
  return [...container.querySelectorAll('.bc-axis-horizontal .tick text')].map(t => t.textContent)
}

function valueLabels(container: HTMLElement): (string | null)[] {
  return [...container.querySelectorAll('.bc-value-label')].map(t => t.textContent)
}

function seriesLabels(container: HTMLElement): (string | null)[] {
  return [...container.querySelectorAll('.bc-direct-label')].map(t => t.textContent)
}

describe('renderBpc applies the documented transform types', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    __resetTransformWarnings()
  })

  it('sort reorders the rendered rows by the requested direction', () => {
    renderBpc(container, `chart bar-vertical {
  valueLabels = true
  data {
    "A" = 1
    "B" = 3
    "C" = 9
    "D" = 7
  }
  transform sort {
    column = "value"
    direction = ascending
  }
}`)
    expect(categoryLabels(container)).toEqual(['A', 'B', 'D', 'C'])
    expect(valueLabels(container)).toEqual(['1', '3', '7', '9'])
  })

  it('filter drops the rows that fail the condition', () => {
    renderBpc(container, `chart bar-vertical {
  valueLabels = true
  data {
    "A" = 1
    "B" = 3
    "C" = 9
    "D" = 7
  }
  transform filter {
    column = "value"
    condition = greater-than
    value = "5"
  }
}`)
    expect(categoryLabels(container)).toEqual(['C', 'D'])
    expect(valueLabels(container)).toEqual(['9', '7'])
  })

  it('hide-columns drops the named series', () => {
    renderBpc(container, `chart bar-vertical {
  valueLabels = true
  data {
    series = "X","Y"
    "A" = 1,2
    "B" = 3,4
  }
  transform hide-columns {
    columns = "X"
  }
}`)
    expect(categoryLabels(container)).toEqual(['A', 'B'])
    expect(valueLabels(container)).toEqual(['2', '4'])
  })

  it('transpose swaps rows and columns', () => {
    renderBpc(container, `chart bar-vertical {
  valueLabels = true
  data {
    series = "X","Y"
    "A" = 1,2
    "B" = 3,4
  }
  transform transpose {
  }
}`)
    expect(categoryLabels(container)).toEqual(['X', 'Y'])
  })

  it('parse re-types the column through the requested operation', () => {
    renderBpc(container, `chart bar-vertical {
  valueLabels = true
  data {
    "A" = -5
    "B" = 3
  }
  transform parse {
    column = "value"
    operation = "abs"
  }
}`)
    expect(valueLabels(container)).toEqual(['5', '3'])
  })

  it('rename renames the series the chart labels', () => {
    renderBpc(container, `chart bar-multi {
  valueLabels = true
  data {
    series = "X","Y"
    "A" = 1,2
    "B" = 3,4
  }
  transform rename {
    column = "X"
    newName = "Z"
  }
}`)
    expect(seriesLabels(container)).toContain('Z')
    expect(seriesLabels(container)).not.toContain('X')
  })

  it('group-by collapses the rows that share a group column', () => {
    renderBpc(container, `chart bar-vertical {
  valueLabels = true
  data {
    "A" = 1
    "A" = 2
    "B" = 3
  }
  transform group-by {
    groupColumns = "label"
    aggregates = "value:sum"
  }
}`)
    expect(categoryLabels(container)).toEqual(['A', 'B'])
    expect(valueLabels(container)).toEqual(['3', '3'])
  })

  it('runs a scene transform on top of the chart pipeline', () => {
    renderBpc(container, `chart bar-vertical {
  valueLabels = true
  data {
    "A" = 1
    "B" = 3
    "C" = 9
    "D" = 7
  }
  scene {
    name = "big only"
    transform filter {
      column = "value"
      condition = greater-than
      value = "5"
    }
  }
}`, { sceneIndex: 0 })
    expect(categoryLabels(container)).toEqual(['C', 'D'])
  })
})

describe('renderBpc transform warnings', () => {
  let container: HTMLElement
  let warn: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    __resetTransformWarnings()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it('does not warn about a documented transform type', () => {
    renderBpc(container, `chart bar-vertical {
  data {
    "A" = 1
    "B" = 3
  }
  transform filter {
    column = "value"
    condition = greater-than
    value = "0"
  }
}`)
    expect(warn).not.toHaveBeenCalled()
  })
})
