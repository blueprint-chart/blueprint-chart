import type { ChartNode } from './types'
import { parse as peggyParse } from './grammar'

export function parse(input: string): ChartNode {
  try {
    return peggyParse(input)
  }
  catch (e: unknown) {
    if (e instanceof Error && 'location' in e) {
      const loc = (e as Error & { location: { start: { line: number, column: number } } }).location
      throw new SyntaxError(`${e.message} at ${loc.start.line}:${loc.start.column}`)
    }
    throw e
  }
}
