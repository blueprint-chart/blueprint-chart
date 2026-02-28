import { describe, it, expect } from 'vitest'
import { parseDate, detectDates } from './date-parse'

describe('parseDate ISO and datetime formats', () => {
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
})

describe('parseDate US formats', () => {
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
})

describe('parseDate European formats', () => {
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
})

describe('parseDate named month formats', () => {
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
})

describe('parseDate year-month formats', () => {
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
})

describe('parseDate invalid inputs', () => {
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

describe('detectDates day formats', () => {
  it('detects ISO dates', () => {
    const result = detectDates(['2024-01-15', '2024-02-20', '2024-03-10'])
    expect(result).not.toBeNull()
    expect(result!.granularity).toBe('day')
    expect(result!.dates).toHaveLength(3)
  })

  it('detects US date format', () => {
    const result = detectDates(['1/15/2024', '2/20/2024'])
    expect(result).not.toBeNull()
    expect(result!.granularity).toBe('day')
  })
})

describe('detectDates month and year formats', () => {
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
})

describe('detectDates invalid inputs', () => {
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
})
