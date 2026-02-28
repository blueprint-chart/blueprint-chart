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

export function parseDate(s: string): Date | null {
  const trimmed = s.trim()
  if (!trimmed) {
    return null
  }

  // For YYYY-only, require exactly 4 digits to avoid matching random numbers
  if (/^\d{4}$/.test(trimmed)) {
    const d = dayjs(trimmed, 'YYYY', true)
    return d.isValid() ? d.toDate() : null
  }

  for (const fmt of DATE_FORMATS) {
    if (fmt === 'YYYY') { // handled above
      continue
    }
    const d = dayjs(trimmed, fmt, true)
    if (d.isValid()) {
      return d.toDate()
    }
  }
  return null
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
      dates.push(d.toDate())
    }
    return { dates, granularity: 'year' }
  }

  for (const fmt of DATE_FORMATS) {
    if (fmt === 'YYYY') {
      continue
    }
    const d = dayjs(first, fmt, true)
    if (d.isValid()) {
      matchedFormat = fmt
      break
    }
  }

  if (!matchedFormat) {
    return null
  }

  for (const label of labels) {
    const d = dayjs(label.trim(), matchedFormat, true)
    if (!d.isValid()) {
      return null
    }
    dates.push(d.toDate())
  }

  return { dates, granularity: granularityForFormat(matchedFormat) }
}
