<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'
import IPhPalette from '~icons/ph/palette'
import IPhCursorClick from '~icons/ph/cursor-click'
import IPhLineSegments from '~icons/ph/line-segments'
</script>

<template>
  <Story title="Section/SettingsSection">
    <Variant
      title="Default"
      :init-state="() => ({ title: 'Appearance' })"
    >
      <template #default="{ state }">
        <SettingsSection
          :title="state.title"
          :icon="IPhPalette"
        >
          <p style="margin: 0; color: var(--bs-secondary-color); font-size: 0.8125rem;">
            Controls for base color, dark mode, contrast, and colorblind simulation go here.
          </p>
        </SettingsSection>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.title"
          title="title"
        />
      </template>
    </Variant>

    <Variant title="With description">
      <SettingsSection
        title="Interactions"
        :icon="IPhCursorClick"
        description="Configure tooltips, crosshairs, and value labels."
      >
        <p style="margin: 0; color: var(--bs-secondary-color); font-size: 0.8125rem;">
          Section body content.
        </p>
      </SettingsSection>
    </Variant>

    <Variant title="Without icon">
      <SettingsSection title="General">
        <p style="margin: 0; color: var(--bs-secondary-color); font-size: 0.8125rem;">
          A section without an icon.
        </p>
      </SettingsSection>
    </Variant>

    <Variant title="Multiple stacked">
      <div class="d-flex flex-column gap-4">
        <SettingsSection
          title="Appearance"
          :icon="IPhPalette"
        >
          <p style="margin: 0; color: var(--bs-secondary-color); font-size: 0.8125rem;">
            Color and contrast settings.
          </p>
        </SettingsSection>

        <SettingsSection
          title="Line Style"
          :icon="IPhLineSegments"
        >
          <p style="margin: 0; color: var(--bs-secondary-color); font-size: 0.8125rem;">
            Interpolation and symbol settings.
          </p>
        </SettingsSection>

        <SettingsSection
          title="Interactions"
          :icon="IPhCursorClick"
        >
          <p style="margin: 0; color: var(--bs-secondary-color); font-size: 0.8125rem;">
            Tooltips and crosshair settings.
          </p>
        </SettingsSection>
      </div>
    </Variant>
  </Story>
</template>
