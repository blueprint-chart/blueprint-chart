<script setup lang="ts">
// Blueprint Chart — client-only renderer for a BPC fragment.
//
// Mirrors the editor's `renderDsl` flow but stripped down: parse the BPC,
// resolve chart-type options, fetch the chart renderer from the registry,
// and paint into an attached <div>. We dynamically `import()` the lib so
// none of its DOM/registry side-effects run during SSR.

import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  source: string
}>()

const container = ref<HTMLElement | null>(null)
const errored = ref(false)
let cancelled = false

async function render() {
  if (!container.value || !props.source) {
    return
  }

  errored.value = false
  container.value.replaceChildren()

  try {
    const lib = await import('@blueprint-chart/lib')
    if (cancelled) {
      return
    }

    const {
      parse,
      parseData,
      buildChartOptions,
      getChart,
      resolveBackgroundColor,
      propertyMap,
      extractChartTypeOptions,
      dataEntriesToString,
      convertColorizes,
      convertHighlights,
      convertAreaFills,
      convertAnnotations,
      convertSeriesOverrides,
      resolveChartTypeOptions,
    } = lib

    const ast = parse(props.source)
    const pMap = propertyMap(ast.properties)

    const dataStr = ast.data ? dataEntriesToString(ast.data) : ''
    const data = parseData(dataStr)
    if (data.labels.length === 0) {
      // Empty data — nothing to render but not an error per se. Surface a
      // gentle notice rather than a confusing blank box.
      errored.value = true
      return
    }

    const renderer = getChart(ast.chartType)
    if (!renderer) {
      errored.value = true
      return
    }

    if (!container.value) {
      return
    }

    const baseTypeOpts = extractChartTypeOptions(ast.chartType, ast.properties)
    const resolvedBase = resolveChartTypeOptions(ast.chartType, baseTypeOpts)
    const bg = resolveBackgroundColor(container.value)
    const chartOpts = buildChartOptions(resolvedBase, bg)

    const colorizes = convertColorizes(ast.colorizes)
    const highlights = convertHighlights(ast.highlights)
    const areaFills = convertAreaFills(ast.areaFills)
    const annotations = convertAnnotations(ast.annotations)
    const seriesOverrides = convertSeriesOverrides(ast.series)

    const sortVal = pMap.get('sort')
    const sortStr = sortVal ? String(sortVal) : undefined
    const sort
      = sortStr === 'ascending' || sortStr === 'descending' ? sortStr : undefined

    const getString = (key: string) =>
      String(pMap.get(key) ?? '') || undefined

    const transparentBg = pMap.get('transparentBackground')
    const frame = {
      title: getString('title'),
      description: getString('description'),
      source: getString('source'),
      sourceUrl: getString('sourceUrl'),
      byline: getString('byline'),
      note: getString('note'),
      padding: String(pMap.get('padding') ?? '') || '16px',
      transparentBackground:
        transparentBg === true || transparentBg === 'true' || undefined,
    }

    renderer(
      container.value,
      data,
      {
        frame,
        sort,
        ...chartOpts,
        colorizes: colorizes.length > 0 ? colorizes : undefined,
        highlights: highlights.length > 0 ? highlights : undefined,
        areaFills: areaFills.length > 0 ? areaFills : undefined,
        annotations: annotations.length > 0 ? annotations : undefined,
        seriesOverrides:
          seriesOverrides.length > 0 ? seriesOverrides : undefined,
      },
      false,
    )

    const theme = getString('theme')
    const frameEl = container.value.querySelector('.bc-frame') as HTMLElement | null
    if (theme && frameEl) {
      frameEl.classList.add(`bc-theme-${theme}`)
    }
  }
  catch {
    errored.value = true
  }
}

onMounted(render)

watch(() => props.source, () => {
  render()
})

onBeforeUnmount(() => {
  cancelled = true
})
</script>

<template>
  <div class="bpc-preview">
    <div
      ref="container"
      class="bpc-preview__container"
    />
    <div
      v-if="errored"
      class="bpc-preview__error"
    >
      Could not render this fragment — view the source instead.
    </div>
  </div>
</template>
