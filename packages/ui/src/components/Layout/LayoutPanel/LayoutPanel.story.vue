<script setup lang="ts">
import Panel from './LayoutPanel.vue'
import ButtonIcon from '../../Button/ButtonIcon/ButtonIcon.vue'
import PhPlus from '~icons/ph/plus'
</script>

<template>
  <Story title="Layout/LayoutPanel">
    <Variant
      title="Default"
      :init-state="() => ({ title: 'Settings' })"
    >
      <template #default="{ state }">
        <div class="panel-story__wrapper">
          <Panel v-bind="state">
            <p>Body content goes here.</p>
          </Panel>
        </div>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.title"
          title="title"
        />
      </template>
    </Variant>
    <Variant
      title="With Actions"
      :init-state="() => ({ title: 'Layers' })"
    >
      <template #default="{ state }">
        <div class="panel-story__wrapper">
          <Panel v-bind="state">
            <template #actions>
              <ButtonIcon
                :icon-left="PhPlus"
                label="Add"
                size="sm"
                variant="outline-secondary"
              />
            </template>
            <p>Body content with actions in the header.</p>
          </Panel>
        </div>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.title"
          title="title"
        />
      </template>
    </Variant>
  </Story>
</template>

<style scoped>
.panel-story__wrapper {
  height: 400px;
}
</style>
