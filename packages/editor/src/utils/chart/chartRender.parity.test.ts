import { samples } from '@blueprint-chart/lib'
import { useChartConfig } from '@/composables/useChartConfig'
import { readRenderSnapshot } from '@/composables/useChartPreview'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import { useDataTable } from '@/composables/useDataTable'
import { useDataTransforms } from '@/composables/useDataTransforms'
import { useDslSync } from '@/composables/useDslSync'
import { useScenes } from '@/composables/useScenes'
import { buildChartRender, snapshotFromState } from './chartRender'
import { parseChartState } from './chartState'

const inline = [
  {
    name: 'frame text and layout',
    dsl: `chart bar-vertical {
  title = "T"
  description = "D"
  byline = "B"
  note = "N"
  source = "S"
  sourceUrl = "https://example.com"
  sizing = fixed
  heightMode = aspect-ratio
  transparentBackground = true
  data {
    "A" = 1
    "B" = 2
  }
}`,
  },
  {
    name: 'allowDarkMode false',
    dsl: `chart bar-vertical {
  allowDarkMode = false
  data {
    "A" = 1
    "B" = 2
  }
}`,
  },
  {
    name: 'transform pipeline',
    dsl: `chart bar-vertical {
  data {
    "A" = 3
    "B" = 1
    "C" = 2
  }
  transform sort {
    column = "value"
    direction = descending
  }
}`,
  },
  {
    name: 'scenes with a scene-only annotation',
    dsl: `chart bar-vertical {
  data {
    "A" = 1
    "B" = 2
  }
  scene "First" {
    title = "Scene title"
    annotation "B" {
      text = "Only in the scene"
    }
  }
}`,
  },
]

const cases = [
  ...samples.map(s => ({ name: s.id, dsl: s.dsl })),
  ...inline,
]

describe('buildChartRender parity', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useChartConfig().reset()
    useChartTypeOptions().reset()
    useScenes().reset()
    useDataTable().reset()
    useDataTransforms().reset()
  })

  it.each(cases)('matches the store-backed render for $name', ({ dsl }) => {
    expect(useDslSync().applyDsl(dsl).success).toBe(true)
    expect(buildChartRender(snapshotFromState(parseChartState(dsl)))).toEqual(buildChartRender(readRenderSnapshot()))
  })

  it('hides scene-only annotations in the base state', () => {
    const { dsl } = inline.find(c => c.name === 'scenes with a scene-only annotation')!
    const render = buildChartRender(snapshotFromState(parseChartState(dsl)))
    expect(render.kind === 'chart' && render.definition.annotations).toEqual([])
  })
})
