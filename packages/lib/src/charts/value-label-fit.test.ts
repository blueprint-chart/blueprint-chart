import { describe, test, expect } from 'vitest'
import { estimateLabelWidth, shouldRenderValueLabel } from './value-label-fit'

describe('estimateLabelWidth', () => {
  test('scales with character count', () => {
    expect(estimateLabelWidth('12')).toBeCloseTo(2 * 6.2)
    expect(estimateLabelWidth('12345')).toBeCloseTo(5 * 6.2)
  })
})

describe('shouldRenderValueLabel', () => {
  test('outside label on a thick enough vertical bar shows', () => {
    expect(shouldRenderValueLabel({
      text: '66.4', placement: 'outside', orientation: 'vertical', barWidth: 40, barHeight: 200,
    })).toBe(true)
  })

  test('outside label on a too-thin vertical bar is suppressed', () => {
    expect(shouldRenderValueLabel({
      text: '66.4', placement: 'outside', orientation: 'vertical', barWidth: 10, barHeight: 200,
    })).toBe(false)
  })

  test('outside label on a too-thin horizontal bar is suppressed', () => {
    expect(shouldRenderValueLabel({
      text: '66.4', placement: 'outside', orientation: 'horizontal', barWidth: 200, barHeight: 10,
    })).toBe(false)
  })

  test('inside label fits a wide horizontal segment', () => {
    expect(shouldRenderValueLabel({
      text: '40', placement: 'inside', orientation: 'horizontal', barWidth: 80, barHeight: 30,
    })).toBe(true)
  })

  test('inside label suppressed when horizontal segment is too short', () => {
    expect(shouldRenderValueLabel({
      text: '12345', placement: 'inside', orientation: 'horizontal', barWidth: 20, barHeight: 30,
    })).toBe(false)
  })

  test('inside label suppressed when vertical segment is too short', () => {
    expect(shouldRenderValueLabel({
      text: '40', placement: 'inside', orientation: 'vertical', barWidth: 60, barHeight: 8,
    })).toBe(false)
  })
})
