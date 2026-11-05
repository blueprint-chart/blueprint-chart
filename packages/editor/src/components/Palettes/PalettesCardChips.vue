<script setup lang="ts">
import { useColorAccessibility } from '@/components/Editor/useColorAccessibility'
import PalettesCardChip from './PalettesCardChip.vue'
import type { PalettesCardChipStatus } from './PalettesCardChip.vue'

const props = defineProps<{
  colors: readonly string[]
}>()

const { lightContrastInfo, darkContrastInfo, cvdInfo } = useColorAccessibility(() => [...props.colors], false, true)

type ContrastInfo = { level: 'AAA' | 'AA' | 'Fail', ratio: string }

function contrastStatus({ level }: ContrastInfo): PalettesCardChipStatus {
  return level === 'Fail' ? 'fail' : 'pass'
}

function contrastDetail({ level, ratio }: ContrastInfo, background: string) {
  const verdict = level === 'Fail' ? 'Below the WCAG AA minimum of 4.5:1.' : `Meets WCAG ${level}.`
  return `Lowest contrast on ${background}: ${ratio}. ${verdict}`
}

const cvdDetail = computed(() => cvdInfo.value?.safe
  ? 'Every color pair stays distinct for protan, deutan and tritan vision.'
  : cvdInfo.value?.issues.map(issue => issue.tooltip).join(' '))
</script>

<template>
  <div class="palettes-card-chips">
    <PalettesCardChip
      v-if="lightContrastInfo"
      class="palettes-card-chips__light"
      :label="`Light ${lightContrastInfo.ratio}`"
      :status="contrastStatus(lightContrastInfo)"
      :detail="contrastDetail(lightContrastInfo, 'white')"
    />
    <PalettesCardChip
      v-if="darkContrastInfo"
      class="palettes-card-chips__dark"
      :label="`Dark ${darkContrastInfo.ratio}`"
      :status="contrastStatus(darkContrastInfo)"
      :detail="contrastDetail(darkContrastInfo, 'black')"
    />
    <PalettesCardChip
      v-if="cvdInfo"
      class="palettes-card-chips__cvd"
      :label="cvdInfo.safe ? 'Color-blind safe' : 'Color-blind risk'"
      :status="cvdInfo.safe ? 'pass' : 'warn'"
      :detail="cvdDetail ?? ''"
    />
  </div>
</template>

<style scoped lang="scss">
.palettes-card-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
</style>
