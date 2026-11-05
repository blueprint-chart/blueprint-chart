import { describeStep } from './describeStep'

describe('describeStep', () => {
  it('describes a sort step', () => {
    expect(describeStep({ type: 'sort', config: { column: 'GDP', direction: 'descending' } })).toBe('GDP descending')
  })

  it('describes a transpose step', () => {
    expect(describeStep({ type: 'transpose', config: {} })).toBe('Swap rows ↔ columns')
  })

  it('describes a rename step', () => {
    expect(describeStep({ type: 'rename', config: { column: 'a', newName: 'b' } })).toBe('a → b')
  })
})
