<template>
  <div class="pipeline-connector" />
</template>

<style scoped lang="scss">
.pipeline-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0 0 1.5rem;
  height: 1.75rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 1.5rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--bs-border-color);
  }
}
</style>
