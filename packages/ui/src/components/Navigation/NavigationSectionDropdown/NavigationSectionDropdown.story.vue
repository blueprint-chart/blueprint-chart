<script setup lang="ts">
import NavigationSectionDropdown from './NavigationSectionDropdown.vue'

const SECTIONS = [
  { text: 'Guide', link: '/guide/getting-started' },
  { text: 'Charts', link: '/charts/' },
  { text: 'Handbook', link: '/handbook/' },
  { text: 'DSL Spec', link: '/spec/dsl' },
  { text: 'API', link: '/api/' },
]
</script>

<template>
  <Story title="Navigation/NavigationSectionDropdown">
    <Variant title="Default (Guide active)">
      <div style="width: 220px;">
        <NavigationSectionDropdown
          :sections="SECTIONS"
          active-link="/guide/getting-started"
        />
      </div>
    </Variant>

    <Variant title="DSL Spec active">
      <div style="width: 220px;">
        <NavigationSectionDropdown
          :sections="SECTIONS"
          active-link="/spec/dsl"
        />
      </div>
    </Variant>

    <Variant title="No active section (fallback label)">
      <div style="width: 220px;">
        <NavigationSectionDropdown
          :sections="SECTIONS"
          trigger-label="Pick a section"
        />
      </div>
    </Variant>
  </Story>
</template>
