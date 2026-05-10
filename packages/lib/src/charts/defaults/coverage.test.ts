import { describe, test, expect } from 'vitest'
import { ALL_CONCERNS, AUDITED_CHART_TYPES } from './types'
import { MATRIX } from './expectations'

describe('defaults audit coverage', () => {
  for (const concern of ALL_CONCERNS) {
    for (const chart of AUDITED_CHART_TYPES) {
      test(`${concern} × ${chart} is declared`, () => {
        const cell = MATRIX[concern][chart]
        expect(
          cell,
          `MATRIX[${concern}][${chart}] is missing — every chart × concern combo must be asserted, todo, na, or open`,
        ).toBeDefined()
      })
    }
  }
})
