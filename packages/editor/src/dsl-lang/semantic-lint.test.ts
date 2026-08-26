import { EditorState } from '@codemirror/state'
import { samples } from '@blueprint-chart/lib'
import { buildDiagnostics } from './diagnostics'
import { useDslSync } from '@/composables/useDslSync'
import { useDslOutput } from '@/composables/useDslOutput'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useScenes } from '@/stores/scenes'
import { useDataTransforms } from '@/stores/dataTransforms'
import { useDataTable } from '@/stores/dataTable'

// Semantic diagnostics are only worth having if a chart with nothing wrong
// with it stays clean: the document the DSL editor seeds is the compact
// canonical output, so that is what must not light up the gutter.
describe('the canonical document of every shipped sample lints clean', () => {
  for (const sample of samples) {
    it(sample.id, () => {
      setActivePinia(createPinia())
      useChartConfig().reset()
      useChartTypeOptions().reset()
      useScenes().reset()
      useDataTransforms().reset()
      useDataTable().reset()

      expect(useDslSync().applyDsl(sample.dsl).success).toBe(true)
      const output = useDslOutput()
      output.compact.value = true
      const doc = EditorState.create({ doc: output.generateDsl() }).doc

      expect(buildDiagnostics({ success: true }, doc)).toEqual([])
    })
  }
})
