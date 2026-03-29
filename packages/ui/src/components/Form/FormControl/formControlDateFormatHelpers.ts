import { timeFormat } from 'd3-time-format'

export interface DatePreset {
  label: string
  fmt: string
  d3?: string
}

export const PRESETS: DatePreset[] = [
  { label: '(automatic)', fmt: '(automatic)' },
  { label: 'Year only', fmt: 'YYYY', d3: '%Y' },
  { label: 'Short year', fmt: '\'YY', d3: '\'%y' },
  { label: 'Quarter', fmt: 'Q', d3: '%Y Q%q' },
  { label: 'Month abbr.', fmt: 'MMM', d3: '%b' },
  { label: 'Month + year', fmt: 'MMM \'YY', d3: '%b \'%y' },
  { label: 'Full month', fmt: 'MMMM', d3: '%B' },
  { label: 'Month + day', fmt: 'MMMM D', d3: '%B %-d' },
  { label: 'Full date', fmt: 'MMMM D, YYYY', d3: '%B %-d, %Y' },
  { label: 'MM/DD/YYYY', fmt: 'MM/DD/YYYY', d3: '%m/%d/%Y' },
  { label: 'DD/MM/YYYY', fmt: 'DD/MM/YYYY', d3: '%d/%m/%Y' },
  { label: 'ISO 8601', fmt: 'YYYY-MM-DD', d3: '%Y-%m-%d' },
  { label: '(custom)', fmt: '(custom)' },
]

export const SAMPLE_DATES: Date[] = [
  new Date(2015, 0, 1),
  new Date(2016, 0, 1),
  new Date(2017, 0, 1),
]

// %q is not natively supported by d3-time-format; substitute quarter number before formatting.
export function formatWithD3(d3Str: string, date: Date): string {
  if (d3Str.includes('%q')) {
    const q = Math.floor(date.getMonth() / 3) + 1
    return timeFormat(d3Str.replace('%q', String(q)))(date)
  }
  return timeFormat(d3Str)(date)
}

export function tickPreview(fmt: string): string | null {
  if (fmt === '(automatic)') {
    return 'auto — adapts to data'
  }
  if (fmt === '(custom)') {
    return null
  }
  const preset = PRESETS.find(p => p.fmt === fmt)
  if (!preset?.d3) {
    return null
  }
  return SAMPLE_DATES.map(d => formatWithD3(preset.d3!, d)).join('  \u00b7  ')
}

export function presetToD3(fmt: string): string {
  if (fmt === '(automatic)') {
    return ''
  }
  const preset = PRESETS.find(p => p.fmt === fmt)
  return preset?.d3 ?? ''
}

export function buildCustomPreview(d3Str: string): string {
  if (!d3Str) {
    return ''
  }
  try {
    return SAMPLE_DATES.map(d => formatWithD3(d3Str, d)).join('  \u00b7  ')
  }
  catch {
    return '(invalid format)'
  }
}

export function buildDisplayValue(modelValue: string, selectedPreset: string, customStr: string): string {
  if (!modelValue) {
    return '(automatic)'
  }
  if (selectedPreset === '(custom)') {
    return customStr || '(custom)'
  }
  const preset = PRESETS.find(p => p.d3 === modelValue)
  return preset?.label ?? modelValue
}

export function resolvePresetState(val: string): { selectedPreset: string, customStr: string } {
  if (!val) {
    return { selectedPreset: '(automatic)', customStr: '' }
  }
  const preset = PRESETS.find(p => p.d3 === val)
  if (preset) {
    return { selectedPreset: preset.fmt, customStr: '' }
  }
  return { selectedPreset: '(custom)', customStr: val }
}
