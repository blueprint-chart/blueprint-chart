<script setup lang="ts">
import DisplayContrastBadge from './DisplayContrastBadge.vue'
</script>

<template>
  <Story title="Display/DisplayContrastBadge">
    <Variant
      title="Default"
      :init-state="() => ({ level: 'AA' })"
    >
      <template #default="{ state }">
        <DisplayContrastBadge :level="state.level" />
      </template>
      <template #controls="{ state }">
        <HstSelect
          v-model="state.level"
          title="level"
          :options="['AAA', 'AA', 'Fail']"
        />
      </template>
    </Variant>
  </Story>
</template>
