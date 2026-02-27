<script setup lang="ts">
import ButtonIconCounter from './ButtonIconCounter.vue'
</script>

<template>
  <Story title="Button/ButtonIconCounter">
    <Variant title="Default">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <ButtonIconCounter :counter="0" />
        <ButtonIconCounter :counter="5" />
        <ButtonIconCounter :counter="42" />
        <ButtonIconCounter :counter="999" />
      </div>
    </Variant>
    <Variant title="Variants">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <ButtonIconCounter
          :counter="5"
          variant="primary"
        />
        <ButtonIconCounter
          :counter="5"
          variant="secondary"
        />
        <ButtonIconCounter
          :counter="5"
          variant="success"
        />
        <ButtonIconCounter
          :counter="5"
          variant="danger"
        />
        <ButtonIconCounter
          :counter="5"
          variant="warning"
        />
      </div>
    </Variant>
  </Story>
</template>
