<script setup lang="ts">
import SectionCard from './SectionCard.vue'
</script>

<template>
  <Story title="Section/SectionCard">
    <Variant
      title="Default"
      :init-state="() => ({ label: 'Options' })"
    >
      <template #default="{ state }">
        <SectionCard :label="state.label">
          <p>Some grouped controls here</p>
        </SectionCard>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.label"
          title="label"
        />
      </template>
    </Variant>
  </Story>
</template>
