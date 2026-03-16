<template>
  <FormControlDropdown
    v-model="chartTheme"
    label="Chart Theme"
    :options="availableThemes"
    block
  />
</template>

<script setup lang="ts">
import { FormControlDropdown } from '@blueprint-chart/ui'
import { useChartTheme } from '@/stores/chartTheme'

const { chartTheme, availableThemes } = useChartTheme()
</script>
