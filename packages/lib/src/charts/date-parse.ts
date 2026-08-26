import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const DATE_FORMATS = [
  'YYYY-MM-DDTHH:mm:ss',
  'YYYY-MM-DD HH:mm',
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  'MM/DD/YYYY',
  'M/D/YYYY',
  'M/D/YY',
  'DD/MM/YYYY',
  'DD.MM.YYYY',
  'MMM D, YYYY',
  'MMMM D, YYYY',
  'MMM YYYY',
  'MMMM YYYY',
  'YYYY-MM',
  'YYYY/MM',
  'YYYY',
]

export type DateGranularity = 'year' | 'month' | 'day' | 'datetime'

function granularityForFormat(fmt: string): DateGranularity {
  if (fmt.includes('HH') || fmt.includes('mm') || fmt.includes('ss')) {
    return 'datetime'
  }
  // Check for day-of-month token (D or DD, but not inside MMMM/MMM/MM which don't contain bare D)
  if (fmt.includes('DD') || /(?<![MA-Z])D(?!D)/.test(fmt)) {
    return 'day'
  }
  if (fmt === 'YYYY') {
    return 'year'
  }
  if (fmt.includes('MM') || fmt.includes('MMM') || fmt.includes('MMMM') || fmt.includes('M/')) {
    return 'month'
  }
  return 'day'
}

/**
 * Build a timezone-independent Date from a validated dayjs instance.
 *
 * dayjs(...).toDate() returns local-midnight, which leaks the host TZ into
 * downstream scales (off-by-one-day in negative-UTC regions). We use the
 * already-parsed Y/M/D/H/m/s components and rebuild via Date.UTC so the
 * resulting epoch ms is stable regardless of where the code runs.
 */
function toUtcDate(d: dayjs.Dayjs): Date {
  return new Date(Date.UTC(
    d.year(),
    d.month(),
    d.date(),
    d.hour(),
    d.minute(),
    d.second(),
    d.millisecond(),
  ))
}

export function parseDate(s: string): Date | null {
  const trimmed = s.trim()
  if (!trimmed) {
    return null
  }

  // For YYYY-only, require exactly 4 digits to avoid matching random numbers
  if (/^\d{4}$/.test(trimmed)) {
    const d = dayjs(trimmed, 'YYYY', true)
    return d.isValid() ? toUtcDate(d) : null
  }

  for (const fmt of DATE_FORMATS) {
    if (fmt === 'YYYY') { // handled above
      continue
    }
    const d = dayjs(trimmed, fmt, true)
    if (d.isValid()) {
      return toUtcDate(d)
    }
  }
  return null
}

/**
 * Parse a string as a date (returning epoch ms) or as a plain number.
 * Date strings take precedence so that e.g. "2020" becomes epoch ms for
 * Jan 1 2020 rather than the number 2020.
 */
export function parseDateOrNumber(s: string): number | undefined {
  const trimmed = s.trim()
  if (!trimmed) {
    return undefined
  }
  const d = parseDate(trimmed)
  if (d) {
    return d.getTime()
  }
  const n = parseFloat(trimmed)
  if (!isNaN(n)) {
    return n
  }
  return undefined
}

/**
 * Parse a string as a plain number or, failing that, as a date (epoch ms).
 * Numbers take precedence so a numeric axis bound like "2000" stays the
 * number 2000 instead of Jan 1 2000.
 */
export function parseNumberOrDate(s: string): number | undefined {
  const trimmed = s.trim()
  if (!trimmed) {
    return undefined
  }
  const n = Number(trimmed)
  if (!isNaN(n)) {
    return n
  }
  return parseDate(trimmed)?.getTime()
}

export function detectDates(labels: string[]): { dates: Date[], granularity: DateGranularity } | null {
  if (labels.length === 0) {
    return null
  }

  const dates: Date[] = []
  let matchedFormat: string | null = null

  // Try to find a format that works for the first label, then verify all labels
  const first = labels[0].trim()
  if (!first) {
    return null
  }

  // Special case: YYYY only
  if (/^\d{4}$/.test(first)) {
    for (const label of labels) {
      const trimmed = label.trim()
      if (!/^\d{4}$/.test(trimmed)) {
        return null
      }
      const d = dayjs(trimmed, 'YYYY', true)
      if (!d.isValid()) {
        return null
      }
      dates.push(toUtcDate(d))
    }
    return { dates, granularity: 'year' }
  }

  // Collect every format that successfully parses the first label, then pick
  // the first one that also parses every remaining label. Locking on the very
  // first match would mis-classify ambiguous strings like '01/02/2024' as
  // MM/DD/YYYY when subsequent rows (e.g. '15/02/2024') prove it's DD/MM.
  const candidateFormats: string[] = []
  for (const fmt of DATE_FORMATS) {
    if (fmt === 'YYYY') {
      continue
    }
    if (dayjs(first, fmt, true).isValid()) {
      candidateFormats.push(fmt)
    }
  }

  if (candidateFormats.length === 0) {
    return null
  }

  for (const fmt of candidateFormats) {
    const parsed: Date[] = []
    let allValid = true
    for (const label of labels) {
      const d = dayjs(label.trim(), fmt, true)
      if (!d.isValid()) {
        allValid = false
        break
      }
      parsed.push(toUtcDate(d))
    }
    if (allValid) {
      matchedFormat = fmt
      dates.push(...parsed)
      break
    }
  }

  if (!matchedFormat) {
    return null
  }

  return { dates, granularity: granularityForFormat(matchedFormat) }
}
