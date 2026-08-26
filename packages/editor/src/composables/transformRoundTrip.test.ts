import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useDataTable } from './useDataTable'
import { useDataTransforms } from './useDataTransforms'
import { useDslOutput } from './useDslOutput'
import { useDslSync } from './useDslSync'
import { useScenes } from './useScenes'
import { TransformType } from '../enums'

const PARSE_DSL = `chart bar-vertical {
  data {
    "A" = 100
    "B" = 50
  }

  transform parse {
    column = "value"
    operation = "log"
  }
}
`

const HIDE_COLUMNS_DSL = `chart bar-multi {
  data {
    series = "X","Y"
    "A" = 1,2
    "B" = 3,4
  }

  transform hide-columns {
    columns = "Y"
  }
}
`

const RENAME_DSL = `chart bar-vertical {
  data {
    "A" = 1
    "B" = 2
  }

  transform rename {
    column = "value"
    newName = "Tonnes"
  }
}
`

const SORT_DSL = `chart bar-vertical {
  sort = descending

  data {
    "A" = 1
    "B" = 2
  }
}
`

/**
 * One open → Data → Visualize → save cycle, exactly as the wizard performs it:
 * `applyDsl` on load, the `prepareDataForEdit` write on the Data → Visualize
 * step (`WizardShell.vue`), `generateDsl` on save.
 */
function openEditSave(dsl: string): string {
  const { applyDsl } = useDslSync()
  expect(applyDsl(dsl).success).toBe(true)
  useChartConfig()._base.data.value = useDataTable().serialize()
  return useDslOutput().generateDsl()
}

function countTransformBlocks(dsl: string, type: string): number {
  return dsl.split(`transform ${type} {`).length - 1
}

describe('transform pipeline round trip', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useScenes().reset()
    useChartConfig().reset()
    useChartTypeOptions().reset()
    useDataTransforms().reset()
    useDataTable().reset()
  })

  it('keeps the source data byte-identical over eight open/save cycles', () => {
    let dsl = openEditSave(PARSE_DSL)
    for (let cycle = 1; cycle <= 8; cycle++) {
      const next = openEditSave(dsl)
      expect(next, `cycle ${cycle}`).toBe(dsl)
      dsl = next
    }
    expect(dsl).toContain('"A" = 100')
    expect(dsl).toContain('"B" = 50')
  })

  it('keeps the column a hide-columns step removes in the source data', () => {
    const dsl = openEditSave(HIDE_COLUMNS_DSL)
    expect(dsl).toContain('series = "X","Y"')
    expect(dsl).toContain('"A" = 1,2')

    const { applyDsl } = useDslSync()
    applyDsl(dsl)
    expect(useDataTable().columns.value).toEqual(['label', 'X', 'Y'])
  })

  it('hydrates a rename step instead of discarding it', () => {
    const { applyDsl } = useDslSync()
    expect(applyDsl(RENAME_DSL).success).toBe(true)

    const { steps } = useDataTransforms()
    expect(steps.value).toHaveLength(1)
    expect(steps.value[0].type).toBe(TransformType.Rename)
    expect(openEditSave(RENAME_DSL)).toContain('transform rename {')
  })

  it('emits base sort as a sort property, once, not as an extra transform block', () => {
    const dsl = openEditSave(SORT_DSL)
    expect(dsl).toContain('sort = descending')
    expect(countTransformBlocks(dsl, 'sort')).toBe(0)
  })

  it('does not multiply an authored sort transform across cycles', () => {
    let dsl = `chart bar-vertical {
  data {
    "A" = 1
    "B" = 2
  }

  transform sort {
    column = "value"
    direction = "descending"
  }
}
`
    for (let cycle = 1; cycle <= 4; cycle++) {
      dsl = openEditSave(dsl)
      expect(countTransformBlocks(dsl, 'sort'), `cycle ${cycle}`).toBe(1)
    }
  })
})
