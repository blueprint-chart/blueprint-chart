<script setup lang="ts">
import NavigationSectionTabs from './NavigationSectionTabs.vue'

const SECTIONS = [
  { text: 'Guide', link: '/guide/getting-started' },
  { text: 'Charts', link: '/charts/' },
  { text: 'Handbook', link: '/handbook/' },
  { text: 'DSL Spec', link: '/spec/dsl' },
  { text: 'API', link: '/api/' },
]
</script>

<template>
  <Story title="Navigation/NavigationSectionTabs">
    <Variant title="Default (Guide active)">
      <NavigationSectionTabs
        :sections="SECTIONS"
        active-link="/guide/getting-started"
      />
    </Variant>

    <Variant title="Charts active">
      <NavigationSectionTabs
        :sections="SECTIONS"
        active-link="/charts/"
      />
    </Variant>

    <Variant title="No active section">
      <NavigationSectionTabs :sections="SECTIONS" />
    </Variant>
  </Story>
</template>
