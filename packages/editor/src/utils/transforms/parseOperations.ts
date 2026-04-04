import type { ColumnType } from '../data/parser'

export interface ParseOperation {
  id: string
  label: string
  description: string
  category: 'type' | 'string' | 'numeric' | 'date'
  accepts: ColumnType[]
  outputType: ColumnType
  params?: string[]
}

const ALL_TYPES: ColumnType[] = ['string', 'number', 'date']

export const parseOperations: ParseOperation[] = [
  // Type Conversions — accept all types (that's their purpose)
  { id: 'to-number', label: 'To Number', description: 'Strip non-numeric characters and convert to number', category: 'type', accepts: ALL_TYPES, outputType: 'number' },
  { id: 'to-string', label: 'To String', description: 'Keep value as plain text', category: 'type', accepts: ALL_TYPES, outputType: 'string' },
  { id: 'to-date', label: 'To Date', description: 'Parse text into an ISO date', category: 'type', accepts: ALL_TYPES, outputType: 'date' },
  { id: 'to-boolean', label: 'To Boolean', description: 'Map yes/no, true/false, 1/0 to boolean', category: 'type', accepts: ALL_TYPES, outputType: 'string' },
  { id: 'parse-json', label: 'Parse JSON', description: 'Parse JSON string and optionally extract a key', category: 'type', accepts: ['string'], outputType: 'string', params: ['key'] },
  // String Operations — accept all types (values are already strings in the data)
  { id: 'trim', label: 'Trim', description: 'Remove leading and trailing whitespace', category: 'string', accepts: ALL_TYPES, outputType: 'string' },
  { id: 'lowercase', label: 'Lowercase', description: 'Convert all characters to lowercase', category: 'string', accepts: ALL_TYPES, outputType: 'string' },
  { id: 'uppercase', label: 'Uppercase', description: 'Convert all characters to uppercase', category: 'string', accepts: ALL_TYPES, outputType: 'string' },
  { id: 'title-case', label: 'Title Case', description: 'Capitalize the first letter of each word', category: 'string', accepts: ALL_TYPES, outputType: 'string' },
  { id: 'slugify', label: 'Slugify', description: 'Lowercase and replace non-alphanumeric with hyphens', category: 'string', accepts: ALL_TYPES, outputType: 'string' },
  { id: 'regex-replace', label: 'Regex Replace', description: 'Find and replace using a regular expression', category: 'string', accepts: ALL_TYPES, outputType: 'string', params: ['pattern', 'replacement'] },
  { id: 'extract', label: 'Extract Substring', description: 'Extract a portion of text by character position', category: 'string', accepts: ALL_TYPES, outputType: 'string', params: ['start', 'end'] },
  { id: 'pad-start', label: 'Pad Start', description: 'Pad the beginning to a fixed length', category: 'string', accepts: ALL_TYPES, outputType: 'string', params: ['length', 'char'] },
  { id: 'pad-end', label: 'Pad End', description: 'Pad the end to a fixed length', category: 'string', accepts: ALL_TYPES, outputType: 'string', params: ['length', 'char'] },
  { id: 'remove-diacritics', label: 'Remove Diacritics', description: 'Strip accents and diacritical marks', category: 'string', accepts: ALL_TYPES, outputType: 'string' },
  { id: 'split', label: 'Split into Columns', description: 'Split values by a separator into new columns', category: 'string', accepts: ALL_TYPES, outputType: 'string', params: ['separator', 'limit'] },
  // Numeric Operations
  { id: 'round', label: 'Round', description: 'Round to a number of decimal places', category: 'numeric', accepts: ['number'], outputType: 'number', params: ['decimals'] },
  { id: 'floor', label: 'Floor', description: 'Round down to the nearest integer', category: 'numeric', accepts: ['number'], outputType: 'number' },
  { id: 'ceil', label: 'Ceiling', description: 'Round up to the nearest integer', category: 'numeric', accepts: ['number'], outputType: 'number' },
  { id: 'abs', label: 'Absolute Value', description: 'Remove the sign (make positive)', category: 'numeric', accepts: ['number'], outputType: 'number' },
  { id: 'clamp', label: 'Clamp', description: 'Constrain values between a min and max', category: 'numeric', accepts: ['number'], outputType: 'number', params: ['min', 'max'] },
  { id: 'log', label: 'Logarithm', description: 'Natural log — compress wide-range values for charting', category: 'numeric', accepts: ['number'], outputType: 'number' },
  { id: 'exp', label: 'Exponential', description: 'Raise e to the power of each value', category: 'numeric', accepts: ['number'], outputType: 'number' },
  { id: 'normalize', label: 'Normalize (0–1)', description: 'Scale values to 0–1 range for cross-series comparison', category: 'numeric', accepts: ['number'], outputType: 'number' },
  { id: 'standardize', label: 'Standardize (z-score)', description: 'Center around mean, scale by std deviation', category: 'numeric', accepts: ['number'], outputType: 'number' },
  { id: 'bin', label: 'Bin/Bucket', description: 'Group values into fixed-size buckets', category: 'numeric', accepts: ['number'], outputType: 'number', params: ['size'] },
  // Date/Time Operations
  { id: 'extract-year', label: 'Extract Year', description: 'Get the four-digit year as a number', category: 'date', accepts: ['date'], outputType: 'number' },
  { id: 'extract-month', label: 'Extract Month', description: 'Get the month (1–12) as a number', category: 'date', accepts: ['date'], outputType: 'number' },
  { id: 'extract-day', label: 'Extract Day', description: 'Get the day of the month as a number', category: 'date', accepts: ['date'], outputType: 'number' },
  { id: 'extract-weekday', label: 'Extract Weekday', description: 'Get the day name (Monday, Tuesday, …)', category: 'date', accepts: ['date'], outputType: 'string' },
  { id: 'extract-hour', label: 'Extract Hour', description: 'Get the hour (0–23) as a number', category: 'date', accepts: ['date'], outputType: 'number' },
  { id: 'shift-date', label: 'Shift Date', description: 'Add or subtract days, months, or years', category: 'date', accepts: ['date'], outputType: 'date', params: ['amount', 'unit'] },
  { id: 'truncate-date', label: 'Truncate to Period', description: 'Round down to start of week, month, quarter, or year', category: 'date', accepts: ['date'], outputType: 'date', params: ['period'] },
  { id: 'date-diff', label: 'Duration Since', description: 'Days between each date and a reference date', category: 'date', accepts: ['date'], outputType: 'number', params: ['reference'] },
]

export const parseOperationMap = new Map(parseOperations.map(o => [o.id, o]))

export function isTypeCompatible(operation: string, columnType: ColumnType): boolean {
  const op = parseOperationMap.get(operation)
  if (!op) {
    return false
  }
  return op.accepts.includes(columnType)
}

export function getOutputType(operation: string): ColumnType {
  return parseOperationMap.get(operation)?.outputType ?? 'string'
}
