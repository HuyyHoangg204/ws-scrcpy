<script setup lang="ts">
import type { ToolBoxElementVue } from './types'
import { computed } from 'vue'

defineProps<{
  elements: ToolBoxElementVue[]
}>()
</script>

<template>
  <div class="control-buttons-list control-wrapper">
    <component
      v-for="(el, index) in elements"
      :is="el"
      :key="index"
    />
  </div>
</template>
