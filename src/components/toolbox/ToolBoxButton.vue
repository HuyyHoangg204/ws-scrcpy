<script setup lang="ts">
import SvgImage from '@/components/ui/SvgImage.vue'
import type { Icon } from '@/types/icon-types'

defineProps<{
  title: string
  icon: Icon
}>()

defineEmits(['click'])
</script>

<template>
  <button class="control-button" :title="title" @click="$emit('click')">
    <SvgImage :type="icon" />
  </button>
</template>