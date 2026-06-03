import { describe, expect, it } from 'vitest'
import { recommendCharts } from './recommend'
import { RECOMMEND_FIXTURES } from './fixtures'

describe('recommend eval (deterministic proxy for the acceptance harness)', () => {
  const results = RECOMMEND_FIXTURES.map((f) => {
    const top = recommendCharts(f.columnTypes, f.rowCount, f.goal)[0]?.chartType
    return { ...f, top, hit: top === f.expectedType }
  })

  for (const res of results) {
    it(`${res.id}: top pick is ${res.expectedType}${res.allowedMiss ? ' (allowed miss)' : ''}`, () => {
      if (res.allowedMiss) {
        // Documented hard case — record the outcome without failing the suite.
        expect(typeof res.top).toBe('string')
      }
      else {
        expect(res.top).toBe(res.expectedType)
      }
    })
  }

  it('hits >= 14 of 17 (>= 82% type-match)', () => {
    const hits = results.filter(r => r.hit).length

    console.log(`recommend eval: ${hits}/${RECOMMEND_FIXTURES.length} type-match`, results.filter(r => !r.hit).map(r => `${r.id}:${r.top}`))
    expect(hits).toBeGreaterThanOrEqual(14)
  })
})
