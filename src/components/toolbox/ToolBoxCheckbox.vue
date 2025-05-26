<script setup lang="ts">
import { computed, ref } from 'vue'
import SvgImage from './SvgImage.vue'
import type { Icon } from '@/types/icon-types'

const { title, icons, optId } = defineProps<{
  title: string
  icons: { on?: Icon; off: Icon }
  optId?: string
}>()

const checked = ref(false)


const inputId = computed(() =>
  optId || `input_${title.toLowerCase().replace(/\s/g, '_')}`
)
</script>

<template>
  <label class="control-button" :for="inputId" :title="title">
    <input
      type="checkbox"
      :id="inputId"
      v-model="checked"
      :class="{ 'two-images': icons.on }"
    />
    <SvgImage :type="icons.off" class="image image-off" />
    <SvgImage v-if="icons.on" :type="icons.on" class="image image-on" />
  </label>
</template>