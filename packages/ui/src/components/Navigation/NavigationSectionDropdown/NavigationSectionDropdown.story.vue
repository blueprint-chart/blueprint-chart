<script setup lang="ts">
import NavigationSectionDropdown from './NavigationSectionDropdown.vue'

const SECTIONS = [
  { text: 'Guide', link: '/guide/getting-started' },
  { text: 'Charts', link: '/charts/' },
  { text: 'Handbook', link: '/handbook/' },
  { text: 'Reference', link: '/reference/' },
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

    <Variant title="Reference active">
      <div style="width: 220px;">
        <NavigationSectionDropdown
          :sections="SECTIONS"
          active-link="/reference/"
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
