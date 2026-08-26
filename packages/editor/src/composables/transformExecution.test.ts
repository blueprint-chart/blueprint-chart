import type { TransformType } from '@/enums'
import { astToDefinition, dataEntriesToString, parse, parseBpcData, parseData, propertyMap, serializeTableData } from '@blueprint-chart/lib'
import { useDataTransforms } from '@/stores/dataTransforms'

/**
 * What the editor renders for a chart: the pipeline hydrated from the DSL
 * (useDslSync), run over the source table, serialised back (useChartPreview).
 */
function editorRenderedData(bpc: string) {
  const ast = parse(bpc)
  const { addStep, applyTransforms } = useDataTransforms()
  for (const node of ast.transforms) {
    const config: Record<string, string> = {}
    for (const [key, value] of propertyMap(node.properties)) {
      config[key] = String(value)
    }
    addStep(node.transformType as TransformType, config)
  }
  const source = parseBpcData(ast.data ? dataEntriesToString(ast.data) : '')
  const out = applyTransforms(source.columns, source.rows, source.columnTypes)
  return parseData(serializeTableData(out.columns, out.rows))
}

/** What a headless render draws for the same file. */
function headlessRenderedData(bpc: string) {
  return astToDefinition(parse(bpc)).data
}

const CASES: Record<string, string> = {
  'sort': `transform sort {
    column = "value"
    direction = ascending
  }`,
  'filter': `transform filter {
    column = "value"
    condition = greater-than
    value = "5"
  }`,
  'hide-columns': `transform hide-columns {
    columns = "value"
  }`,
  'transpose': `transform transpose {
  }`,
  'parse': `transform parse {
    column = "value"
    operation = "abs"
  }`,
  'rename': `transform rename {
    column = "value"
    newName = "total"
  }`,
  'group-by': `transform group-by {
    groupColumns = "label"
    aggregates = "value:sum"
  }`,
  'computed': `transform computed {
    column = "value"
  }`,
}

describe('transform execution parity between the editor and a headless render', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  for (const [type, block] of Object.entries(CASES)) {
    it(`renders the same rows for transform ${type}`, () => {
      const bpc = `chart bar-vertical {
  data {
    "A" = -5
    "A" = 3
    "B" = 9
    "C" = 7
  }

  ${block}
}`
      expect(headlessRenderedData(bpc)).toEqual(editorRenderedData(bpc))
    })
  }
})
