import { describe, it, expect, beforeEach } from 'vitest'
import { useDataTransforms } from './useDataTransforms'

describe('useDataTransforms: state management', () => {
  beforeEach(() => {
    useDataTransforms().reset()
  })

  it('starts with no steps', () => {
    const { steps } = useDataTransforms()
    expect(steps.value).toEqual([])
  })

  it('adds a step', () => {
    const { steps, addStep } = useDataTransforms()
    addStep('sort', { column: 'Name', direction: 'ascending' })
    expect(steps.value.length).toBe(1)
    expect(steps.value[0].type).toBe('sort')
    expect(steps.value[0].config.column).toBe('Name')
  })

  it('removes a step', () => {
    const { steps, addStep, removeStep } = useDataTransforms()
    addStep('sort', { column: 'A' })
    addStep('filter', { column: 'B' })
    const id = steps.value[0].id
    removeStep(id)
    expect(steps.value.length).toBe(1)
    expect(steps.value[0].type).toBe('filter')
  })

  it('updates a step config', () => {
    const { steps, addStep, updateStep } = useDataTransforms()
    addStep('sort', { column: 'A', direction: 'ascending' })
    updateStep(steps.value[0].id, { column: 'B', direction: 'descending' })
    expect(steps.value[0].config.column).toBe('B')
    expect(steps.value[0].config.direction).toBe('descending')
  })

  it('moves a step to a new index', () => {
    const { steps, addStep, moveStep } = useDataTransforms()
    addStep('sort', { column: 'A' })
    addStep('filter', { column: 'B' })
    addStep('sort', { column: 'C' })
    const id = steps.value[2].id
    moveStep(id, 0)
    expect(steps.value[0].config.column).toBe('C')
    expect(steps.value[1].config.column).toBe('A')
  })

  it('addStep returns the step id', () => {
    const { addStep } = useDataTransforms()
    const id = addStep('sort', { column: 'A' })
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('resets state', () => {
    const { steps, addStep, reset } = useDataTransforms()
    addStep('sort', { column: 'A' })
    reset()
    expect(steps.value).toEqual([])
  })
})

describe('useDataTransforms: pipeline', () => {
  beforeEach(() => {
    useDataTransforms().reset()
  })

  it('applies multiple transforms in order', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Value', condition: 'greater-than', value: '20' })
    addStep('sort', { column: 'Value', direction: 'ascending' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['C', '50'], ['A', '10'], ['B', '30']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('B')
    expect(result.rows[1][0]).toBe('C')
  })

  it('rename works in pipeline with sort', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('rename', { column: 'Name', newName: 'Fruit' })
    addStep('sort', { column: 'Value', direction: 'ascending' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['Bananas', '58'], ['Apples', '10']],
      ['string', 'number'],
    )
    expect(result.columns[0]).toBe('Fruit')
    expect(result.rows[0][0]).toBe('Apples')
  })

  it('filter before group-by', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Country', condition: 'not-equals', value: 'UK' })
    addStep('group-by', { groupColumns: 'Country', aggregates: 'Revenue:sum' })
    const result = applyTransforms(
      ['Country', 'Revenue'],
      [['US', '100'], ['UK', '50'], ['US', '200'], ['UK', '30']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(1)
    expect(result.rows[0][0]).toBe('US')
    expect(result.rows[0][1]).toBe('300')
  })
})

describe('validateStep', () => {
  beforeEach(() => {
    useDataTransforms().reset()
  })

  it('returns null for valid parse step', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'parse' as const, config: { column: 'V', operation: 'round', decimals: '2' } }
    expect(validateStep(step, ['V'], ['number'])).toBeNull()
  })

  it('returns error for incompatible parse operation', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'parse' as const, config: { column: 'V', operation: 'round' } }
    const error = validateStep(step, ['V'], ['string'])
    expect(error).toContain('Round')
    expect(error).toContain('number')
    expect(error).toContain('string')
  })

  it('returns error when column not found', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'parse' as const, config: { column: 'Missing', operation: 'trim' } }
    expect(validateStep(step, ['V'], ['string'])).toContain('not found')
  })

  it('returns error for filter without column', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'filter' as const, config: {} }
    expect(validateStep(step, ['V'], ['string'])).toContain('No column')
  })

  it('returns error for sort without column', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'sort' as const, config: {} }
    expect(validateStep(step, ['V'], ['string'])).toContain('No column')
  })

  it('returns null for valid sort step', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'sort' as const, config: { column: 'V', direction: 'ascending' } }
    expect(validateStep(step, ['V'], ['number'])).toBeNull()
  })

  it('returns error for group-by without group columns', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'group-by' as const, config: { aggregates: 'Revenue:sum' } }
    expect(validateStep(step, ['Revenue'], ['number'])).toContain('No group columns')
  })

  it('returns error for group-by without aggregates', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'group-by' as const, config: { groupColumns: 'Country' } }
    expect(validateStep(step, ['Country'], ['string'])).toContain('No aggregates')
  })

  it('returns null for transpose (no validation needed)', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'transpose' as const, config: {} }
    expect(validateStep(step, ['V'], ['string'])).toBeNull()
  })

  it('returns null for type conversion on any column type', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'parse' as const, config: { column: 'V', operation: 'to-number' } }
    expect(validateStep(step, ['V'], ['string'])).toBeNull()
    expect(validateStep(step, ['V'], ['date'])).toBeNull()
    expect(validateStep(step, ['V'], ['number'])).toBeNull()
  })

  it('returns error for date operation on string column', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'parse' as const, config: { column: 'V', operation: 'extract-year' } }
    const error = validateStep(step, ['V'], ['string'])
    expect(error).toContain('date')
    expect(error).toContain('string')
  })

  it('returns null for string operation on number column (coerced)', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: 'parse' as const, config: { column: 'V', operation: 'trim' } }
    expect(validateStep(step, ['V'], ['number'])).toBeNull()
  })
})

describe('applyStepList', () => {
  it('applies steps without mutating singleton state', () => {
    const t = useDataTransforms()
    t.reset()
    t.addStep('sort', { column: 'Name', direction: 'ascending' })
    expect(t.steps.value.length).toBe(1)

    const filterSteps = [
      { id: '99', type: 'filter' as const, config: { column: 'Name', condition: 'equals', value: 'A' } },
    ]
    const result = t.applyStepList(
      filterSteps,
      ['Name', 'Val'],
      [['A', '1'], ['B', '2'], ['A', '3']],
      ['string', 'number'],
    )

    // Filter applied: only rows with Name=A
    expect(result.rows.length).toBe(2)
    expect(result.rows.every(r => r[0] === 'A')).toBe(true)

    // Singleton state unchanged
    expect(t.steps.value.length).toBe(1)
    expect(t.steps.value[0].type).toBe('sort')
    t.reset()
  })

  it('applies multiple steps in order', () => {
    const { applyStepList } = useDataTransforms()
    const steps = [
      { id: '1', type: 'sort' as const, config: { column: 'Val', direction: 'descending' } },
      { id: '2', type: 'filter' as const, config: { column: 'Val', condition: 'greater-than', value: '5' } },
    ]
    const result = applyStepList(
      steps,
      ['Name', 'Val'],
      [['A', '10'], ['B', '3'], ['C', '7']],
      ['string', 'number'],
    )
    // Sort desc then filter >5 → A(10), C(7)
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('A')
    expect(result.rows[1][0]).toBe('C')
  })

  it('returns original data for empty steps', () => {
    const { applyStepList } = useDataTransforms()
    const result = applyStepList(
      [],
      ['X'],
      [['1'], ['2']],
      ['number'],
    )
    expect(result.columns).toEqual(['X'])
    expect(result.rows).toEqual([['1'], ['2']])
  })
})
