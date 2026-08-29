import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * #124: three editor paths compared DSL booleans against a lowercase 'true',
 * two of them via a regex that could not even match `TRUE`. The library
 * already exports `toBool` for exactly this (converter.ts:11).
 */
describe('editor DSL boolean reads are case-insensitive (#124)', () => {
  const files = [
    'src/composables/useChartThumbnail.ts',
    'src/stores/chartSession.ts',
    'src/composables/useDslSync.ts',
  ]

  it.each(files)('%s does not compare against a bare lowercase true', (file) => {
    const source = readFileSync(resolve(process.cwd(), file), 'utf-8')
    expect(source).not.toMatch(/===\s*'true'/)
  })

  it.each(files)('%s has no case-sensitive boolean regex', (file) => {
    const source = readFileSync(resolve(process.cwd(), file), 'utf-8')
    // A `(true|false)` literal whose closing slash is not followed by an `i`.
    expect(source).not.toMatch(/\(true\|false\)\/(?![a-z]*i)/)
  })
})
