import { describe, expect, it } from 'vitest'
import { classifyIntent } from './intent'

describe('classifyIntent', () => {
  it('returns none for undefined or blank goals', () => {
    expect(classifyIntent(undefined)).toBe('none')
    expect(classifyIntent('   ')).toBe('none')
  })

  it('detects part-to-whole', () => {
    expect(classifyIntent('each region as a share of the total')).toBe('part-to-whole')
  })

  it('detects composition-over-time before part-to-whole', () => {
    expect(classifyIntent('energy mix composition over time')).toBe('composition-over-time')
  })

  it('detects range', () => {
    expect(classifyIntent('the polling lead with its margin of error')).toBe('range')
  })

  it('detects ranking', () => {
    expect(classifyIntent('the most-spoken languages, ranked')).toBe('ranking')
  })

  it('detects trend', () => {
    expect(classifyIntent('how the stock climbed over time')).toBe('trend')
  })

  it('treats "overtakes" as trend (the categorical-x rule lives in the table, not here)', () => {
    expect(classifyIntent('software overtakes hardware')).toBe('trend')
  })

  it('falls back to comparison for generic compare language', () => {
    expect(classifyIntent('compare emissions across countries')).toBe('comparison')
  })

  it('returns none when nothing matches', () => {
    expect(classifyIntent('a chart of some data')).toBe('none')
  })
})
