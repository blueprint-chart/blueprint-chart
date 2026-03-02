function numericOp(value: string, fn: (n: number) => number): string {
  const n = parseFloat(value)
  if (Number.isNaN(n)) {
    return value
  }
  const result = fn(n)
  return Number.isNaN(result) ? value : String(result)
}

function dateOp(value: string, fn: (d: Date) => string): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : fn(d)
}

function transformTypeConversion(value: string, operation: string, config: Record<string, string>): string {
  switch (operation) {
    case 'to-number': {
      const n = Number(value.replace(/[^0-9.\-+eE]/g, ''))
      return Number.isNaN(n) ? '' : String(n)
    }
    case 'to-string':
      return value
    case 'to-date':
      return dateOp(value, d => d.toISOString())
    case 'to-boolean': {
      const lower = value.toLowerCase().trim()
      if (['true', '1', 'yes', 'on', 'y'].includes(lower)) {
        return 'true'
      }
      if (['false', '0', 'no', 'off', 'n', ''].includes(lower)) {
        return 'false'
      }
      return value
    }
    case 'parse-json': {
      try {
        const parsed = JSON.parse(value)
        if (config.key) {
          return String(parsed[config.key] ?? '')
        }
        return JSON.stringify(parsed)
      }
      catch { return value }
    }
    default:
      return value
  }
}

function transformString(value: string, operation: string, config: Record<string, string>): string {
  switch (operation) {
    case 'trim':
      return value.trim()
    case 'lowercase':
      return value.toLowerCase()
    case 'uppercase':
      return value.toUpperCase()
    case 'title-case':
      return value.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    case 'slugify':
      return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    case 'regex-replace': {
      if (!config.pattern) {
        return value
      }
      try {
        return value.replace(new RegExp(config.pattern, 'g'), config.replacement ?? '')
      }
      catch { return value }
    }
    case 'extract':
      return value.slice(Number(config.start) || 0, config.end ? Number(config.end) : undefined)
    case 'pad-start':
      return value.padStart(Number(config.length) || 0, config.char || ' ')
    case 'pad-end':
      return value.padEnd(Number(config.length) || 0, config.char || ' ')
    case 'remove-diacritics':
      return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    default:
      return value
  }
}

function transformNumeric(value: string, operation: string, config: Record<string, string>): string {
  switch (operation) {
    case 'round': {
      const decimals = Number(config.decimals) || 0
      const factor = 10 ** decimals
      return numericOp(value, n => Math.round(n * factor) / factor)
    }
    case 'floor':
      return numericOp(value, Math.floor)
    case 'ceil':
      return numericOp(value, Math.ceil)
    case 'abs':
      return numericOp(value, Math.abs)
    case 'clamp': {
      const min = config.min ? Number(config.min) : -Infinity
      const max = config.max ? Number(config.max) : Infinity
      return numericOp(value, n => Math.min(Math.max(n, min), max))
    }
    case 'log':
      return numericOp(value, n => n > 0 ? Math.log(n) : NaN)
    case 'exp':
      return numericOp(value, Math.exp)
    case 'bin': {
      const size = Number(config.size) || 1
      return numericOp(value, n => Math.floor(n / size) * size)
    }
    default:
      return value
  }
}

function transformDate(value: string, operation: string, config: Record<string, string>): string {
  switch (operation) {
    case 'extract-year':
      return dateOp(value, d => String(d.getFullYear()))
    case 'extract-month':
      return dateOp(value, d => String(d.getMonth() + 1))
    case 'extract-day':
      return dateOp(value, d => String(d.getDate()))
    case 'extract-weekday':
      return dateOp(value, d => d.toLocaleDateString('en', { weekday: 'long' }))
    case 'extract-hour':
      return dateOp(value, d => String(d.getHours()))
    case 'shift-date':
      return dateOp(value, (d) => {
        const amount = Number(config.amount) || 0
        const unit = config.unit || 'days'
        if (unit === 'years') {
          d.setFullYear(d.getFullYear() + amount)
        }
        else if (unit === 'months') {
          d.setMonth(d.getMonth() + amount)
        }
        else {
          d.setDate(d.getDate() + amount)
        }
        return d.toISOString()
      })
    case 'truncate-date':
      return dateOp(value, (d) => {
        const period = config.period || 'month'
        if (period === 'year') {
          return new Date(d.getFullYear(), 0, 1).toISOString()
        }
        if (period === 'quarter') {
          return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1).toISOString()
        }
        if (period === 'month') {
          return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
        }
        if (period === 'week') {
          d.setDate(d.getDate() - d.getDay())
          d.setHours(0, 0, 0, 0)
          return d.toISOString()
        }
        return d.toISOString()
      })
    case 'date-diff': {
      const ref = new Date(config.reference || new Date().toISOString())
      if (Number.isNaN(ref.getTime())) {
        return value
      }
      return dateOp(value, d => String(Math.round((d.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24))))
    }
    default:
      return value
  }
}

export function transformValue(value: string, operation: string, config: Record<string, string>): string {
  // Type conversions
  if (operation.startsWith('to-') || operation === 'parse-json') {
    return transformTypeConversion(value, operation, config)
  }
  // Numeric operations
  const numericOps = new Set(['round', 'floor', 'ceil', 'abs', 'clamp', 'log', 'exp', 'bin'])
  if (numericOps.has(operation)) {
    return transformNumeric(value, operation, config)
  }
  // Date operations
  if (operation.startsWith('extract-') || operation.startsWith('shift-') || operation.startsWith('truncate-') || operation === 'date-diff') {
    return transformDate(value, operation, config)
  }
  // String operations (default)
  return transformString(value, operation, config)
}
