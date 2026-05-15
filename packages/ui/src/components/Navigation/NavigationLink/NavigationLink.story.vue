<script setup lang="ts">
import NavigationLink from './NavigationLink.vue'
</script>

<template>
  <Story title="Navigation/NavigationLink">
    <Variant title="Default">
      <NavigationLink
        to="/charts"
        label="My Charts"
      />
    </Variant>

    <Variant title="Active">
      <NavigationLink
        to="/charts"
        label="My Charts"
        :active="true"
      />
    </Variant>

    <Variant title="External">
      <NavigationLink
        to="https://example.com"
        label="Docs"
        :external="true"
      />
    </Variant>
  </Story>
</template>
