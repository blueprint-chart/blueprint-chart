<script setup lang="ts">
import DisplayContrastBadge from './DisplayContrastBadge.vue'
</script>

<template>
  <Story title="Display/DisplayContrastBadge">
    <Variant
      title="AAA"
      :init-state="() => ({ level: 'AAA', ratio: '8.2:1' })"
    >
      <template #default="{ state }">
        <DisplayContrastBadge :level="state.level" :ratio="state.ratio" />
      </template>
      <template #controls="{ state }">
        <HstSelect
          v-model="state.level"
          title="level"
          :options="['AAA', 'AA', 'Fail']"
        />
        <HstText v-model="state.ratio" title="ratio" />
      </template>
    </Variant>
    <Variant
      title="AA"
      :init-state="() => ({ level: 'AA', ratio: '5.2:1' })"
    >
      <template #default="{ state }">
        <DisplayContrastBadge :level="state.level" :ratio="state.ratio" />
      </template>
    </Variant>
    <Variant
      title="Fail"
      :init-state="() => ({ level: 'Fail', ratio: '2.1:1' })"
    >
      <template #default="{ state }">
        <DisplayContrastBadge :level="state.level" :ratio="state.ratio" />
      </template>
    </Variant>
  </Story>
</template>
