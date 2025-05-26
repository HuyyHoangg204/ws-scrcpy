<!-- app/ui -->


<script setup lang="ts">
import { computed } from 'vue'
import type { Icon } from '@/types/icon-types.ts'

// Import SVG dưới dạng raw string
import KeyboardSVG from '@/assets/images/public/images/skin-light/ic_keyboard_678_48dp.svg?raw';
import MoreSVG from '@/assets/images/public/images/skin-light/ic_more_horiz_678_48dp.svg?raw';
import CameraSVG from '@/assets/images/public/images/skin-light/ic_photo_camera_678_48dp.svg?raw';
import PowerSVG from '@/assets/images/public/images/skin-light/ic_power_settings_new_678_48px.svg?raw';
import VolumeDownSVG from '@/assets/images/public/images/skin-light/ic_volume_down_678_48px.svg?raw';
import VolumeUpSVG from '@/assets/images/public/images/skin-light/ic_volume_up_678_48px.svg?raw';
import BackSVG from '@/assets/images/public/images/skin-light/System_Back_678.svg?raw';
import HomeSVG from '@/assets/images/public/images/skin-light/System_Home_678.svg?raw';
import OverviewSVG from '@/assets/images/public/images/skin-light/System_Overview_678.svg?raw';
import CancelSVG from '@/assets/images/public/images/buttons/cancel.svg?raw';
import OfflineSVG from '@/assets/images/public/images/buttons/offline.svg?raw';
import RefreshSVG from '@/assets/images/public/images/buttons/refresh.svg?raw';
import SettingsSVG from '@/assets/images/public/images/buttons/settings.svg?raw';
import MenuSVG from '@/assets/images/public/images/buttons/menu.svg?raw';
import ArrowBackSVG from '@/assets/images/public/images/buttons/arrow_back.svg?raw';
import ToggleOnSVG from '@/assets/images/public/images/buttons/toggle_on.svg?raw';
import ToggleOffSVG from '@/assets/images/public/images/buttons/toggle_off.svg?raw';

// Props
const props = defineProps<{ type: Icon }>()

// Bản đồ SVG
const svgMap: Record<Icon, string> = {
  BACK: BackSVG,
  HOME: HomeSVG,
  OVERVIEW: OverviewSVG,
  POWER: PowerSVG,
  VOLUME_UP: VolumeUpSVG,
  VOLUME_DOWN: VolumeDownSVG,
  MORE: MoreSVG,
  CAMERA: CameraSVG,
  KEYBOARD: KeyboardSVG,
  CANCEL: CancelSVG,
  OFFLINE: OfflineSVG,
  REFRESH: RefreshSVG,
  SETTINGS: SettingsSVG,
  MENU: MenuSVG,
  ARROW_BACK: ArrowBackSVG,
  TOGGLE_ON: ToggleOnSVG,
  TOGGLE_OFF: ToggleOffSVG,
}

// Lấy nội dung SVG dựa trên prop `type`
const svgContent = computed(() => svgMap[props.type] || '')
</script>

<template>
  <span v-html="svgContent" />
</template>
