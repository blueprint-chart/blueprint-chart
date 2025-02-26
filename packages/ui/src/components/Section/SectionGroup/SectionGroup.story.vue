<script setup lang="ts">
import SectionGroup from './SectionGroup.vue'
</script>

<template>
  <Story title="Section/SectionGroup">
    <Variant title="With controls">
      <SectionGroup title="Titles">
        <div class="section-group-story__placeholder">
          FormControlTextInput (Title)
        </div>
        <div class="section-group-story__placeholder">
          FormControlTextInput (Subtitle)
        </div>
      </SectionGroup>
    </Variant>
    <Variant title="Flush (no top padding)">
      <SectionGroup
        title="Chart Type"
        flush
      >
        <div class="section-group-story__placeholder">
          FormControlSelect (Type)
        </div>
      </SectionGroup>
    </Variant>
    <Variant title="Multiple sections stacked">
      <SectionGroup
        title="X-Axis"
        flush
      >
        <div class="section-group-story__placeholder">
          Label input
        </div>
        <div class="section-group-story__placeholder">
          Format select
        </div>
      </SectionGroup>
      <SectionGroup title="Y-Axis">
        <div class="section-group-story__placeholder">
          Label input
        </div>
        <div class="section-group-story__placeholder">
          Min / Max inputs
        </div>
      </SectionGroup>
      <SectionGroup title="Grid">
        <div class="section-group-story__placeholder">
          Toggle group
        </div>
      </SectionGroup>
    </Variant>
  </Story>
</template>

<style scoped>
.section-group-story__placeholder {
  padding: 0.5rem 0.75rem;
  background: var(--bs-tertiary-bg);
  border-radius: var(--bs-border-radius);
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
}
</style>
