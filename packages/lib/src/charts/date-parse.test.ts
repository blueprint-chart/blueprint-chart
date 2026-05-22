import { describe, it, expect } from 'vitest'
import { parseDate, parseDateOrNumber, detectDates } from './date-parse'

describe('parseDate', () => {
  it('parses YYYY-MM-DD', () => {
    const d = parseDate('2024-01-15')
    expect(d).not.toBeNull()
    expect(d!.getFullYear()).toBe(2024)
    expect(d!.getMonth()).toBe(0)
    expect(d!.getDate()).toBe(15)
  })

  it('parses YYYY-MM-DDTHH:mm:ss', () => {
    const d = parseDate('2024-01-15T14:30:00')
    expect(d).not.toBeNull()
    expect(d!.getHours()).toBe(14)
    expect(d!.getMinutes()).toBe(30)
  })

  it('parses YYYY-MM-DD HH:mm', () => {
    const d = parseDate('2024-01-15 14:30')
    expect(d).not.toBeNull()
    expect(d!.getHours()).toBe(14)
  })

  it('parses YYYY/MM/DD', () => {
    const d = parseDate('2024/01/15')
    expect(d).not.toBeNull()
    expect(d!.getFullYear()).toBe(2024)
  })

  it('parses MM/DD/YYYY', () => {
    const d = parseDate('01/15/2024')
    expect(d).not.toBeNull()
    expect(d!.getMonth()).toBe(0)
    expect(d!.getDate()).toBe(15)
  })

  it('parses M/D/YYYY', () => {
    const d = parseDate('1/5/2024')
    expect(d).not.toBeNull()
    expect(d!.getMonth()).toBe(0)
    expect(d!.getDate()).toBe(5)
  })

  it('parses M/D/YY', () => {
    const d = parseDate('1/5/24')
    expect(d).not.toBeNull()
    expect(d!.getDate()).toBe(5)
  })

  it('parses DD/MM/YYYY', () => {
    const d = parseDate('15/01/2024')
    expect(d).not.toBeNull()
    expect(d!.getDate()).toBe(15)
  })

  it('parses DD.MM.YYYY', () => {
    const d = parseDate('15.01.2024')
    expect(d).not.toBeNull()
    expect(d!.getDate()).toBe(15)
  })

  it('parses MMM YYYY', () => {
    const d = parseDate('Jan 2024')
    expect(d).not.toBeNull()
    expect(d!.getFullYear()).toBe(2024)
    expect(d!.getMonth()).toBe(0)
  })

  it('parses MMMM YYYY', () => {
    const d = parseDate('January 2024')
    expect(d).not.toBeNull()
    expect(d!.getFullYear()).toBe(2024)
  })

  it('parses MMM D, YYYY', () => {
    const d = parseDate('Jan 15, 2024')
    expect(d).not.toBeNull()
    expect(d!.getDate()).toBe(15)
  })

  it('parses MMMM D, YYYY', () => {
    const d = parseDate('January 15, 2024')
    expect(d).not.toBeNull()
    expect(d!.getDate()).toBe(15)
  })

  it('parses YYYY-MM', () => {
    const d = parseDate('2024-01')
    expect(d).not.toBeNull()
    expect(d!.getFullYear()).toBe(2024)
    expect(d!.getMonth()).toBe(0)
  })

  it('parses YYYY/MM', () => {
    const d = parseDate('2024/01')
    expect(d).not.toBeNull()
    expect(d!.getFullYear()).toBe(2024)
  })

  it('parses YYYY (4-digit year only)', () => {
    const d = parseDate('2024')
    expect(d).not.toBeNull()
    expect(d!.getFullYear()).toBe(2024)
  })

  it('rejects non-4-digit numbers as years', () => {
    expect(parseDate('42')).toBeNull()
    expect(parseDate('12345')).toBeNull()
  })

  it('returns null for non-date strings', () => {
    expect(parseDate('Apple')).toBeNull()
    expect(parseDate('')).toBeNull()
    expect(parseDate('hello world')).toBeNull()
  })
})

describe('detectDates', () => {
  it('detects ISO dates', () => {
    const result = detectDates(['2024-01-15', '2024-02-20', '2024-03-10'])
    expect(result).not.toBeNull()
    expect(result!.granularity).toBe('day')
    expect(result!.dates).toHaveLength(3)
  })

  it('detects year-month labels', () => {
    const result = detectDates(['2024-01', '2024-02', '2024-03'])
    expect(result).not.toBeNull()
    expect(result!.granularity).toBe('month')
  })

  it('detects year-only labels', () => {
    const result = detectDates(['2020', '2021', '2022'])
    expect(result).not.toBeNull()
    expect(result!.granularity).toBe('year')
  })

  it('detects US date format', () => {
    const result = detectDates(['1/15/2024', '2/20/2024'])
    expect(result).not.toBeNull()
    expect(result!.granularity).toBe('day')
  })

  it('detects MMM YYYY format', () => {
    const result = detectDates(['Jan 2024', 'Feb 2024', 'Mar 2024'])
    expect(result).not.toBeNull()
    expect(result!.granularity).toBe('month')
  })

  it('detects datetime format', () => {
    const result = detectDates(['2024-01-15T10:00:00', '2024-01-15T11:00:00'])
    expect(result).not.toBeNull()
    expect(result!.granularity).toBe('datetime')
  })

  it('returns null for non-date labels', () => {
    expect(detectDates(['Apple', 'Banana', 'Cherry'])).toBeNull()
  })

  it('returns null for empty array', () => {
    expect(detectDates([])).toBeNull()
  })

  it('returns null if some labels do not parse', () => {
    expect(detectDates(['2024-01-15', 'not-a-date'])).toBeNull()
  })

  it('returns null for mixed formats', () => {
    expect(detectDates(['2024-01-15', '01/15/2024'])).toBeNull()
  })

  // ── N6: ambiguous-format disambiguation ──────────────────────────

  it('disambiguates DD/MM/YYYY from MM/DD/YYYY by checking every label', () => {
    // '01/02/2024' alone is ambiguous, but '15/02/2024' rules out MM/DD.
    const result = detectDates(['01/02/2024', '15/02/2024'])
    expect(result).not.toBeNull()
    expect(result!.dates).toHaveLength(2)
    // DD/MM/YYYY → first label is 1 Feb, second is 15 Feb.
    expect(result!.dates[0].getUTCMonth()).toBe(1) // February
    expect(result!.dates[0].getUTCDate()).toBe(1)
    expect(result!.dates[1].getUTCMonth()).toBe(1)
    expect(result!.dates[1].getUTCDate()).toBe(15)
  })

  it('still returns null when labels use genuinely different formats', () => {
    // Each label parses, but no single format parses both.
    expect(detectDates(['2024-01-15', '15.01.2024'])).toBeNull()
  })
})

describe('parseDate — N5: timezone-independent epochs', () => {
  it('returns UTC midnight for YYYY-MM-DD', () => {
    const d = parseDate('2024-01-15')
    expect(d).not.toBeNull()
    expect(d!.getTime()).toBe(Date.UTC(2024, 0, 15))
  })

  it('returns the same epoch for YYYY/MM/DD as for YYYY-MM-DD', () => {
    expect(parseDate('2024/01/15')!.getTime()).toBe(Date.UTC(2024, 0, 15))
  })

  it('returns UTC midnight for YYYY', () => {
    expect(parseDate('2024')!.getTime()).toBe(Date.UTC(2024, 0, 1))
  })

  it('returns UTC midnight for YYYY-MM', () => {
    expect(parseDate('2024-03')!.getTime()).toBe(Date.UTC(2024, 2, 1))
  })

  it('returns UTC for datetime strings', () => {
    expect(parseDate('2024-01-15T14:30:00')!.getTime())
      .toBe(Date.UTC(2024, 0, 15, 14, 30, 0))
  })
})

describe('parseDateOrNumber — N5: timezone-independent epochs', () => {
  it('returns UTC epoch ms for date strings', () => {
    expect(parseDateOrNumber('2024-01-15')).toBe(Date.UTC(2024, 0, 15))
  })

  it('still parses plain numbers', () => {
    expect(parseDateOrNumber('42')).toBe(42)
  })
})
