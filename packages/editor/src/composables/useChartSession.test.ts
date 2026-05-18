import { ChartType } from '@blueprint-chart/lib'
import { useChartSession } from './useChartSession'
import { useChartConfig } from '@/stores/chartConfig'
import { useDataTable } from '@/stores/dataTable'
import { useDataTransforms } from '@/stores/dataTransforms'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useScenes } from '@/stores/scenes'

const VALID_BPC = `chart donut {
  title = "Pie of the year"
  description = "A circular tale"

  data {
    "Slice A" = 40
    "Slice B" = 30
    "Slice C" = 30
  }
}
`

describe('useChartSession › createFromDsl', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    useChartConfig().reset()
    useDataTable().reset()
    useDataTransforms().reset()
    useChartTypeOptions().reset()
    useScenes().reset()
  })

  it('returns a non-null sessionId for valid BPC and populates the chart config', () => {
    const session = useChartSession()
    const newId = session.createFromDsl(VALID_BPC)

    expect(newId).not.toBeNull()
    expect(newId).toMatch(/^[a-zA-Z0-9]{11}$/)
    expect(session.sessionId.value).toBe(newId)

    const config = useChartConfig()
    expect(config.chartType.value).toBe(ChartType.Donut)
    expect(config.title.value).toBe('Pie of the year')

    // Session was persisted under its new id.
    const stored = localStorage.getItem(`blueprint-chart:${newId}`)
    expect(stored).not.toBeNull()
    expect(stored!.trimStart().startsWith('chart')).toBe(true)
  })

  it('returns null for invalid BPC and leaves stores untouched', () => {
    const session = useChartSession()
    const config = useChartConfig()
    const beforeType = config.chartType.value
    const beforeTitle = config.title.value

    const result = session.createFromDsl('this is not valid bpc !!!')

    expect(result).toBeNull()
    expect(session.sessionId.value).toBe('')
    expect(config.chartType.value).toBe(beforeType)
    expect(config.title.value).toBe(beforeTitle)

    // No localStorage entry was written.
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('blueprint-chart:')) {
        keys.push(key)
      }
    }
    expect(keys).toEqual([])
  })

  it('returns null for an empty string', () => {
    const session = useChartSession()
    const result = session.createFromDsl('')

    expect(result).toBeNull()
    expect(session.sessionId.value).toBe('')
  })
})
