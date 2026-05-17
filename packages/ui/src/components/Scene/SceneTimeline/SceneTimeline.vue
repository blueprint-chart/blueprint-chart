<template>
  <div class="scene-timeline">
    <SceneTimelineControls
      v-model:active-index="activeIndex"
      :total="scenes.length"
      :playing="playing"
      @play="$emit('play')"
      @pause="$emit('pause')"
    />

    <div class="scene-timeline__items">
      <SceneTimelineItem
        v-for="scene in scenes"
        :key="scene.index"
        :name="scene.name"
        :index="scene.index"
        :active="scene.index === activeIndex"
        :thumbnail="scene.thumbnail ?? null"
        :removable="scene.removable ?? true"
        @select="activeIndex = scene.index"
        @remove="$emit('remove', scene.index)"
      />

      <div class="scene-timeline__items__add">
        <ButtonAdd @click="$emit('add')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const activeIndex = defineModel<number>('activeIndex', { default: -1 })

withDefaults(defineProps<{
  scenes: { name: string | null, index: number, thumbnail?: string | null, removable?: boolean }[]
  playing?: boolean
}>(), {
  playing: false,
})

defineEmits<{
  add: []
  remove: [index: number]
  play: []
  pause: []
}>()
</script>

<style scoped lang="scss">
.scene-timeline {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  min-height: 96px;
  background: transparent;
  width: 100%;

  &__items {
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
    overflow-x: auto;
    flex: 1;
    min-width: 0;
    padding: 0.25rem 0;

    &::-webkit-scrollbar {
      display: none;
    }

    scrollbar-width: none;

    &__add {
      width: 120px;
      min-width: 120px;
      flex-shrink: 0;
      align-self: stretch;

      :deep(.button-add.btn) {
        height: 100%;
        border-radius: var(--bc-radius-md);
      }
    }
  }
}
</style>
