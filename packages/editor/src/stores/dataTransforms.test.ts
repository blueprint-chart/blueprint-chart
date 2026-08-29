import { TransformType, FilterCondition } from '@/enums'
import type { TransformStep } from './dataTransforms'
import { useDataTransforms } from './dataTransforms'

describe('useDataTransforms: state management', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with no steps', () => {
    const { steps } = useDataTransforms()
    expect(steps.value).toEqual([])
  })

  it('adds a step', () => {
    const { steps, addStep } = useDataTransforms()
    addStep(TransformType.Sort, { column: 'Name', direction: 'ascending' })
    expect(steps.value.length).toBe(1)
    expect(steps.value[0].type).toBe(TransformType.Sort)
    expect(steps.value[0].config.column).toBe('Name')
  })

  it('removes a step', () => {
    const { steps, addStep, removeStep } = useDataTransforms()
    addStep(TransformType.Sort, { column: 'A' })
    addStep(TransformType.Filter, { column: 'B' })
    const id = steps.value[0].id
    removeStep(id)
    expect(steps.value.length).toBe(1)
    expect(steps.value[0].type).toBe(TransformType.Filter)
  })

  it('updates a step config', () => {
    const { steps, addStep, updateStep } = useDataTransforms()
    addStep(TransformType.Sort, { column: 'A', direction: 'ascending' })
    updateStep(steps.value[0].id, { column: 'B', direction: 'descending' })
    expect(steps.value[0].config.column).toBe('B')
    expect(steps.value[0].config.direction).toBe('descending')
  })

  it('moves a step to a new index', () => {
    const { steps, addStep, moveStep } = useDataTransforms()
    addStep(TransformType.Sort, { column: 'A' })
    addStep(TransformType.Filter, { column: 'B' })
    addStep(TransformType.Sort, { column: 'C' })
    const id = steps.value[2].id
    moveStep(id, 0)
    expect(steps.value[0].config.column).toBe('C')
    expect(steps.value[1].config.column).toBe('A')
  })

  it('addStep returns the step id', () => {
    const { addStep } = useDataTransforms()
    const id = addStep(TransformType.Sort, { column: 'A' })
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('resets state', () => {
    const { steps, addStep, reset } = useDataTransforms()
    addStep(TransformType.Sort, { column: 'A' })
    reset()
    expect(steps.value).toEqual([])
  })
})

describe('useDataTransforms: pipeline', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('applies multiple transforms in order', () => {
    const { addStep, applyTransforms } = useDataTransforms()
    addStep(TransformType.Filter, { column: 'Value', condition: FilterCondition.GreaterThan, value: '20' })
    addStep(TransformType.Sort, { column: 'Value', direction: 'ascending' })
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
    addStep(TransformType.Rename, { column: 'Name', newName: 'Fruit' })
    addStep(TransformType.Sort, { column: 'Value', direction: 'ascending' })
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
    addStep(TransformType.Filter, { column: 'Country', condition: FilterCondition.NotEquals, value: 'UK' })
    addStep(TransformType.GroupBy, { groupColumns: 'Country', aggregates: 'Revenue:sum' })
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
    setActivePinia(createPinia())
  })

  it('returns null for valid parse step', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: TransformType.Parse, config: { column: 'V', operation: 'round', decimals: '2' } }
    expect(validateStep(step, ['V'], ['number'])).toBeNull()
  })

  it('returns error for incompatible parse operation', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: TransformType.Parse, config: { column: 'V', operation: 'round' } }
    const error = validateStep(step, ['V'], ['string'])
    expect(error).toContain('Round')
    expect(error).toContain('number')
    expect(error).toContain('string')
  })

  it('returns error when column not found', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: TransformType.Parse, config: { column: 'Missing', operation: 'trim' } }
    expect(validateStep(step, ['V'], ['string'])).toContain('not found')
  })

  it('returns error for filter without column', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: TransformType.Filter, config: {} }
    expect(validateStep(step, ['V'], ['string'])).toContain('No column')
  })

  it('returns error for sort without column', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: TransformType.Sort, config: {} }
    expect(validateStep(step, ['V'], ['string'])).toContain('No column')
  })

  it('returns null for valid sort step', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: TransformType.Sort, config: { column: 'V', direction: 'ascending' } }
    expect(validateStep(step, ['V'], ['number'])).toBeNull()
  })

  it('returns error for group-by without group columns', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: TransformType.GroupBy, config: { aggregates: 'Revenue:sum' } }
    expect(validateStep(step, ['Revenue'], ['number'])).toContain('No group columns')
  })

  it('returns error for group-by without aggregates', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: TransformType.GroupBy, config: { groupColumns: 'Country' } }
    expect(validateStep(step, ['Country'], ['string'])).toContain('No aggregates')
  })

  it('returns null for transpose (no validation needed)', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: TransformType.Transpose, config: {} }
    expect(validateStep(step, ['V'], ['string'])).toBeNull()
  })

  it('returns null for type conversion on any column type', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: TransformType.Parse, config: { column: 'V', operation: 'to-number' } }
    expect(validateStep(step, ['V'], ['string'])).toBeNull()
    expect(validateStep(step, ['V'], ['date'])).toBeNull()
    expect(validateStep(step, ['V'], ['number'])).toBeNull()
  })

  it('returns error for date operation on string column', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: TransformType.Parse, config: { column: 'V', operation: 'extract-year' } }
    const error = validateStep(step, ['V'], ['string'])
    expect(error).toContain('date')
    expect(error).toContain('string')
  })

  it('returns null for string operation on number column (coerced)', () => {
    const { validateStep } = useDataTransforms()
    const step = { id: '1', type: TransformType.Parse, config: { column: 'V', operation: 'trim' } }
    expect(validateStep(step, ['V'], ['number'])).toBeNull()
  })
})

describe('applyStepList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('applies steps without mutating singleton state', () => {
    const t = useDataTransforms()
    t.addStep(TransformType.Sort, { column: 'Name', direction: 'ascending' })
    expect(t.steps.value.length).toBe(1)

    const filterSteps = [
      { id: '99', type: TransformType.Filter, config: { column: 'Name', condition: FilterCondition.Equals, value: 'A' } },
    ]
    const result = t.applyStepList(
      filterSteps,
      ['Name', 'Val'],
      [['A', '1'], ['B', '2'], ['A', '3']],
      ['string', 'number'],
    )

    expect(result.rows.length).toBe(2)
    expect(result.rows.every(r => r[0] === 'A')).toBe(true)
    expect(t.steps.value.length).toBe(1)
    expect(t.steps.value[0].type).toBe(TransformType.Sort)
  })

  it('applies multiple steps in order', () => {
    const { applyStepList } = useDataTransforms()
    const steps: TransformStep[] = [
      { id: '1', type: TransformType.Sort, config: { column: 'Val', direction: 'descending' } },
      { id: '2', type: TransformType.Filter, config: { column: 'Val', condition: FilterCondition.GreaterThan, value: '5' } },
    ]
    const result = applyStepList(
      steps,
      ['Name', 'Val'],
      [['A', '10'], ['B', '3'], ['C', '7']],
      ['string', 'number'],
    )
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

describe('useDataTransforms: scene stash', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('enterScene stashes the base pipeline and exitScene restores it', () => {
    const { steps, baseSteps, addStep, enterScene, exitScene } = useDataTransforms()
    addStep(TransformType.Sort, { column: 'Value' })
    const scene = [{ id: 's1', type: TransformType.Transpose, config: {} }]

    enterScene(scene)
    expect(steps.value.map(s => s.type)).toEqual([TransformType.Transpose])
    expect(baseSteps.value.map(s => s.type)).toEqual([TransformType.Sort])

    const sceneSteps = exitScene()
    expect(sceneSteps?.map(s => s.type)).toEqual([TransformType.Transpose])
    expect(steps.value.map(s => s.type)).toEqual([TransformType.Sort])
    expect(baseSteps.value).toEqual([])
  })

  it('a second exitScene is a no-op, so a deferred watcher re-run cannot wipe the pipeline', () => {
    const { steps, addStep, enterScene, exitScene } = useDataTransforms()
    addStep(TransformType.Sort, { column: 'Value' })
    enterScene([])
    exitScene()
    expect(exitScene()).toBeNull()
    expect(steps.value.map(s => s.type)).toEqual([TransformType.Sort])
  })

  it('enterScene while already stashed keeps the original base', () => {
    const { baseSteps, addStep, enterScene } = useDataTransforms()
    addStep(TransformType.Sort, { column: 'Value' })
    enterScene([{ id: 's1', type: TransformType.Transpose, config: {} }])
    enterScene([{ id: 's2', type: TransformType.Filter, config: { column: 'Value' } }])
    expect(baseSteps.value.map(s => s.type)).toEqual([TransformType.Sort])
  })

  it('reset drops the stash, so exitScene after a DSL apply cannot restore stale steps', () => {
    const { steps, addStep, enterScene, exitScene, reset } = useDataTransforms()
    addStep(TransformType.Sort, { column: 'Value' })
    enterScene([])
    reset()
    addStep(TransformType.Filter, { column: 'Value' })
    expect(exitScene()).toBeNull()
    expect(steps.value.map(s => s.type)).toEqual([TransformType.Filter])
  })
})
