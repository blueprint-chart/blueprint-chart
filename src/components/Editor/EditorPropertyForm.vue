<template>
  <div class="d-flex flex-column gap-3">
    <BFormGroup
      label="Title"
      label-for="prop-title"
    >
      <BFormInput
        id="prop-title"
        v-model="title"
        placeholder="Chart title"
      />
    </BFormGroup>

    <BFormGroup
      label="Description"
      label-for="prop-description"
    >
      <BFormInput
        id="prop-description"
        v-model="description"
        placeholder="Short description"
      />
    </BFormGroup>

    <BFormGroup
      label="Byline"
      label-for="prop-byline"
    >
      <BFormInput
        id="prop-byline"
        v-model="byline"
        placeholder="Author or byline"
      />
    </BFormGroup>

    <BFormGroup
      label="Source"
      label-for="prop-source"
    >
      <BFormInput
        id="prop-source"
        v-model="source"
        placeholder="Data source"
      />
    </BFormGroup>

    <BFormGroup
      label="Source URL"
      label-for="prop-source-url"
    >
      <BFormInput
        id="prop-source-url"
        v-model="sourceUrl"
        type="url"
        placeholder="https://..."
      />
    </BFormGroup>

    <BFormGroup
      label="Sort"
      label-for="prop-sort"
    >
      <BFormSelect
        id="prop-sort"
        v-model="sort"
        :options="sortOptions"
      />
    </BFormGroup>
  </div>
</template>

<script setup lang="ts">
import { useChartConfig } from '@/composables/useChartConfig'

const { title, description, byline, source, sourceUrl, sort } = useChartConfig()

const sortOptions = [
  { value: 'none', text: 'None' },
  { value: 'ascending', text: 'Ascending' },
  { value: 'descending', text: 'Descending' },
]
</script>
