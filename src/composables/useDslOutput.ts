import { computed } from 'vue'
import { useChartConfig } from './useChartConfig'

export function useDslOutput() {
  const config = useChartConfig()

  const dsl = computed(() => {
    let output = `chart ${config.chartType.value} {\n`

    if (config.title.value) {
      output += `  title = "${config.title.value}"\n`
    }
    if (config.description.value) {
      output += `  description = "${config.description.value}"\n`
    }
    if (config.byline.value) {
      output += `  byline = "${config.byline.value}"\n`
    }
    if (config.source.value) {
      output += `  source = "${config.source.value}"\n`
    }
    if (config.sourceUrl.value) {
      output += `  sourceUrl = "${config.sourceUrl.value}"\n`
    }
    if (config.sort.value !== 'none') {
      output += `  sort = ${config.sort.value}\n`
    }

    if (config.data.value) {
      output += '\n  data {\n'
      const lines = config.data.value
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
      output += lines.map(l => `    ${l}`).join('\n')
      output += '\n  }\n'
    }

    output += '}\n'
    return output
  })

  return { dsl }
}
