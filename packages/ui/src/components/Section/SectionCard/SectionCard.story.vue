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

    <Variant title="No label">
      <SectionCard>
        <p>Card without a label</p>
      </SectionCard>
    </Variant>

    <Variant title="With header slot">
      <SectionCard>
        <template #header>
          <div style="padding: 0.5rem 0.75rem; background: var(--bs-secondary-bg); display: flex; justify-content: space-between; align-items: center;">
            <span>Header content</span>
            <button>Toggle</button>
          </div>
        </template>
        <p>Body content below header</p>
      </SectionCard>
    </Variant>
  </Story>
</template>
