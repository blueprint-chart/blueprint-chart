<script setup lang="ts">
import SectionTitle from './SectionTitle.vue'
</script>

<template>
  <Story title="Section/SectionTitle">
    <Variant
      title="Default"
      :init-state="() => ({ flush: false })"
    >
      <template #default="{ state }">
        <SectionTitle :flush="state.flush">
          Section Heading
        </SectionTitle>
      </template>
      <template #controls="{ state }">
        <HstCheckbox
          v-model="state.flush"
          title="flush"
        />
      </template>
    </Variant>
  </Story>
</template>
