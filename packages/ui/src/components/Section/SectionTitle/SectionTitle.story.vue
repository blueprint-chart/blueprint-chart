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

    <Variant
      title="With eyebrow"
      :init-state="() => ({ flush: false, eyebrow: 'my charts' })"
    >
      <template #default="{ state }">
        <SectionTitle
          :flush="state.flush"
          :eyebrow="state.eyebrow"
        >
          Section Heading
        </SectionTitle>
      </template>
      <template #controls="{ state }">
        <HstCheckbox
          v-model="state.flush"
          title="flush"
        />
        <HstText
          v-model="state.eyebrow"
          title="eyebrow"
        />
      </template>
    </Variant>
  </Story>
</template>
