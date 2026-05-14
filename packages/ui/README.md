# @blueprint-chart/ui

Vue 3 component library for Blueprint Chart editors and apps. Built on Bootstrap 5 and BootstrapVueNext, themed via CSS custom properties.

## Install

```bash
npm install @blueprint-chart/ui vue bootstrap bootstrap-vue-next @vueuse/core
```

Vue, Bootstrap, BootstrapVueNext, and @vueuse/core are peer dependencies — your app supplies them.

## Usage

```ts
// main.ts
import 'bootstrap/dist/css/bootstrap.css'
import { createApp } from 'vue'
import { createBootstrap } from 'bootstrap-vue-next'
import App from './App.vue'

createApp(App).use(createBootstrap()).mount('#app')
```

```vue
<script setup lang="ts">
import { ButtonIcon, FormControlTextInput } from '@blueprint-chart/ui'
</script>

<template>
  <ButtonIcon icon="ph-plus" />
  <FormControlTextInput placeholder="Enter a value" />
</template>
```

## License

MIT
