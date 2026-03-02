import { describe, it, expect, beforeEach } from 'vitest'
import { useDataTransforms } from './useDataTransforms'

describe('useDataTransforms', () => {
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

  it('applies sort transform ascending', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('sort', { column: 'Value', direction: 'ascending' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['Bananas', '58'], ['Apples', '10'], ['Cherries', '30']],
      ['string', 'number'],
    )
    expect(result.rows[0][0]).toBe('Apples')
    expect(result.rows[1][0]).toBe('Cherries')
    expect(result.rows[2][0]).toBe('Bananas')
  })

  it('applies sort transform descending', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('sort', { column: 'Value', direction: 'descending' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['Bananas', '58'], ['Apples', '10'], ['Cherries', '30']],
      ['string', 'number'],
    )
    expect(result.rows[0][0]).toBe('Bananas')
    expect(result.rows[2][0]).toBe('Apples')
  })

  it('applies filter transform', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Name', condition: 'equals', value: 'Apples' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['Apples', '42'], ['Bananas', '58']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(1)
    expect(result.rows[0][0]).toBe('Apples')
  })

  it('applies filter contains condition', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Name', condition: 'contains', value: 'an' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['Apples', '42'], ['Bananas', '58'], ['Oranges', '31']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(2)
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

  it('ignores sort on unknown column', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('sort', { column: 'Unknown', direction: 'ascending' })
    const rows = [['A', '1'], ['B', '2']]
    const result = applyTransforms(['Name', 'Value'], rows, ['string', 'number'])
    expect(result.rows.length).toBe(2)
  })

  it('addStep returns the step id', () => {
    const { addStep } = useDataTransforms()
    const id = addStep('sort', { column: 'A' })
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('applies transpose transform', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('transpose')
    const result = applyTransforms(
      ['Country', 'Gold', 'Silver'],
      [['USA', '40', '44'], ['China', '38', '32']],
      ['string', 'number', 'number'],
    )
    // First column values become headers: Field, USA, China
    expect(result.columns).toEqual(['Field', 'USA', 'China'])
    // Old headers (except first) become first column: Gold, Silver
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('Gold')
    expect(result.rows[0][1]).toBe('40')
    expect(result.rows[0][2]).toBe('38')
    expect(result.rows[1][0]).toBe('Silver')
  })

  it('transpose on empty data returns same', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('transpose')
    const result = applyTransforms([], [], [])
    expect(result.columns).toEqual([])
    expect(result.rows).toEqual([])
  })

  it('transpose detects numeric column types', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('transpose')
    const result = applyTransforms(
      ['Category', 'Q1', 'Q2'],
      [['Sales', '100', '200'], ['Profit', '50', '80']],
      ['string', 'number', 'number'],
    )
    // New columns: Field, Sales, Profit
    // Sales column should be number type (100, 50)
    expect(result.columnTypes[0]).toBe('string') // Field column
    expect(result.columnTypes[1]).toBe('number') // Sales values
    expect(result.columnTypes[2]).toBe('number') // Profit values
  })

  it('applies filter greater-than with currency-like values', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Price', condition: 'greater-than', value: '50' })
    const result = applyTransforms(
      ['Item', 'Price'],
      [['A', '$30'], ['B', '$75'], ['C', '$100']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('B')
    expect(result.rows[1][0]).toBe('C')
  })

  it('applies filter less-than', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Value', condition: 'less-than', value: '30' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['A', '10'], ['B', '50'], ['C', '20']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('A')
    expect(result.rows[1][0]).toBe('C')
  })

  it('applies filter not-equals', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('filter', { column: 'Name', condition: 'not-equals', value: 'B' })
    const result = applyTransforms(
      ['Name', 'Value'],
      [['A', '1'], ['B', '2'], ['C', '3']],
      ['string', 'number'],
    )
    expect(result.rows.length).toBe(2)
    expect(result.rows[0][0]).toBe('A')
    expect(result.rows[1][0]).toBe('C')
  })

  it('sort handles date type columns', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('sort', { column: 'Date', direction: 'ascending' })
    const result = applyTransforms(
      ['Date', 'Value'],
      [['2024-03-15', '10'], ['2024-01-01', '20'], ['2024-02-10', '30']],
      ['date', 'number'],
    )
    expect(result.rows[0][0]).toBe('2024-01-01')
    expect(result.rows[1][0]).toBe('2024-02-10')
    expect(result.rows[2][0]).toBe('2024-03-15')
  })

  it('applies hide-columns transform', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('hide-columns', { columns: 'Value' })
    const result = applyTransforms(
      ['Name', 'Value', 'Category'],
      [['A', '10', 'X'], ['B', '20', 'Y']],
      ['string', 'number', 'string'],
    )
    expect(result.columns).toEqual(['Name', 'Category'])
    expect(result.rows[0]).toEqual(['A', 'X'])
    expect(result.rows[1]).toEqual(['B', 'Y'])
    expect(result.columnTypes).toEqual(['string', 'string'])
  })

  it('applies hide-columns with multiple columns', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('hide-columns', { columns: 'Value,Category' })
    const result = applyTransforms(
      ['Name', 'Value', 'Category'],
      [['A', '10', 'X'], ['B', '20', 'Y']],
      ['string', 'number', 'string'],
    )
    expect(result.columns).toEqual(['Name'])
    expect(result.rows[0]).toEqual(['A'])
  })

  it('hide-columns with no config returns same data', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep('hide-columns', {})
    const result = applyTransforms(
      ['Name', 'Value'],
      [['A', '10']],
      ['string', 'number'],
    )
    expect(result.columns).toEqual(['Name', 'Value'])
  })

  it('resets state', () => {
    const { steps, addStep, reset } = useDataTransforms()
    addStep('sort', { column: 'A' })
    reset()
    expect(steps.value).toEqual([])
  })
})
