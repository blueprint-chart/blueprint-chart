<script setup lang="ts">
import IconRail from './NavigationIconRail.vue'
import IconRailEntry from './NavigationIconRailEntry.vue'
import ButtonIcon from '../../Button/ButtonIcon/ButtonIcon.vue'
import PhChartBar from '~icons/ph/chart-bar'
import PhTextAa from '~icons/ph/text-aa'
import PhChartLineUp from '~icons/ph/chart-line-up'
import PhCrosshairSimple from '~icons/ph/crosshair-simple'
import PhGear from '~icons/ph/gear'
</script>

<template>
  <Story title="Navigation/NavigationIconRail">
    <Variant
      title="Default"
      :init-state="() => ({ value: 'type' })"
    >
      <template #default="{ state }">
        <div class="icon-rail-story__wrapper">
          <IconRail v-model="state.value">
            <IconRailEntry value="type" :icon="PhChartBar" tooltip="Chart Type" />
            <IconRailEntry value="text" :icon="PhTextAa" tooltip="Text" />
            <IconRailEntry value="series" :icon="PhChartLineUp" tooltip="Series" />
            <IconRailEntry value="axes" :icon="PhCrosshairSimple" tooltip="Axes" />
            <template #footer>
              <ButtonIcon
                :icon-left="PhGear"
                label="Settings"
                hide-label
                square
                variant="link"
              />
            </template>
          </IconRail>
        </div>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
      </template>
    </Variant>
  </Story>
</template>

<style scoped>
.icon-rail-story__wrapper {
  height: 400px;
  display: flex;
  justify-content: flex-end;
}
</style>
