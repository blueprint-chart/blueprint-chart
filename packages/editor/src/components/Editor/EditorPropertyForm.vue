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
      <BFormTextarea
        id="prop-description"
        v-model="description"
        placeholder="Short description"
        rows="2"
        max-rows="5"
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
      label="Note"
      label-for="prop-note"
    >
      <BFormTextarea
        id="prop-note"
        v-model="note"
        placeholder="Additional note or caveat"
        rows="2"
        max-rows="4"
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
  </div>
</template>

<script setup lang="ts">
import { useChartConfig } from '@/stores/chartConfig'

const { title, description, byline, note, source, sourceUrl } = useChartConfig()
</script>
