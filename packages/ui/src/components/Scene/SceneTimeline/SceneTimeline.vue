<template>
  <div class="scene-timeline">
    <SceneTimelineControls
      :total="scenes.length"
      :active-index="activeIndex"
      :playing="playing"
      @update:active-index="$emit('update:activeIndex', $event)"
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
        @select="$emit('update:activeIndex', scene.index)"
        @remove="$emit('remove', scene.index)"
      />
    </div>

    <ButtonAdd
      size="sm"
      label="Add"
      @click="$emit('add')"
    />
  </div>
</template>

<script setup lang="ts">
import ButtonAdd from '../../Button/ButtonAdd/ButtonAdd.vue'
import SceneTimelineItem from '../SceneTimelineItem/SceneTimelineItem.vue'
import SceneTimelineControls from './SceneTimelineControls.vue'

withDefaults(defineProps<{
  scenes: { name: string | null, index: number, thumbnail?: string | null, removable?: boolean }[]
  activeIndex?: number
  playing?: boolean
}>(), {
  activeIndex: -1,
  playing: false,
})

defineEmits<{
  'update:activeIndex': [index: number]
  'add': []
  'remove': [index: number]
  'play': []
  'pause': []
}>()
</script>

<style scoped lang="scss">
.scene-timeline {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid var(--bs-border-color);
  padding: 0.5rem 1rem;
  min-height: 96px;
}

.scene-timeline__items {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  flex: 1;
  min-width: 0;
  padding: 0.25rem 0;

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
}
</style>
