import { readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import type { ChartOptionDef } from '../../lib/src/charts/types'
import { getChartOptions } from '../../lib/src/charts/registry'
import { ChartOptionType } from '../../lib/src/enums'

const CHARTS_DIR = join(import.meta.dirname, '..', 'src', 'charts')

export const START = '<!-- options:start -->'
export const END = '<!-- options:end -->'

/** Palettes are enumerated on the palettes guide; there are 53 of them. */
const PALETTE_GUIDE = '/guide/palettes'

function formatType(def: ChartOptionDef): string {
  if (def.key === 'colorPalette') {
    return `${def.type}, see [Palettes](${PALETTE_GUIDE})`
  }
  if (def.type === ChartOptionType.Select && def.choices?.length) {
    const values = def.choices.map(c => (c.value === '' ? '`""`' : `\`${c.value}\``))
    return `${def.type}: ${values.join(', ')}`
  }
  return def.type
}

function formatDefault(def: ChartOptionDef): string {
  if (def.default === undefined) {
    return '(unset)'
  }
  return def.default === '' ? '`""`' : `\`${String(def.default)}\``
}

/** The generated `## Properties` section for one chart type, markers included. */
export function renderOptionsSection(chartType: string): string {
  const defs = getChartOptions(chartType)
  if (defs.length === 0) {
    throw new Error(`no registered options for chart type "${chartType}"`)
  }
  const rows = defs.map(d => `| \`${d.key}\` | ${formatType(d)} | ${formatDefault(d)} |`)
  return [
    START,
    '',
    '## Properties',
    '',
    `Every property \`${chartType}\` accepts, beside the [frame and layout keys](/reference/dsl/properties) every chart shares. Anything absent from this table is rejected by \`validateChart\` and ignored by the renderer.`,
    '',
    '| Property | Type | Default |',
    '| --- | --- | --- |',
    ...rows,
    '',
    END,
  ].join('\n')
}

/** Replace the marked region of a chart page with the freshly generated one. */
export function applyOptionsSection(page: string, chartType: string): string {
  const from = page.indexOf(START)
  const to = page.indexOf(END)
  if (from === -1 || to === -1) {
    throw new Error(`missing ${START} / ${END} markers for chart type "${chartType}"`)
  }
  return page.slice(0, from) + renderOptionsSection(chartType) + page.slice(to + END.length)
}

export async function chartPages(): Promise<string[]> {
  const files = await readdir(CHARTS_DIR)
  return files.filter(f => f.endsWith('.md') && f !== 'index.md').sort()
}

async function main() {
  for (const file of await chartPages()) {
    const path = join(CHARTS_DIR, file)
    const page = await readFile(path, 'utf8')
    const updated = applyOptionsSection(page, basename(file, '.md'))
    if (updated !== page) {
      await writeFile(path, updated)
      console.log(`updated ${file}`)
    }
  }
}

if (process.argv[1] === import.meta.filename) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
