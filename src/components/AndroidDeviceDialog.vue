<template>

<Dialog
    v-model:visible="props.visible"
    modal
    :style="{
      width: 'auto',
      padding: '0',
      backgroundColor: 'transparent',
      border: 'none',
    }"
    class="stream-dialog"
    position="center"
    :closable="false"
    :contentStyle="{ padding: '0' }"
    header=""
    :draggable="true"
    @update:visible="handleVisibilityChange"
  >
    <template #header>
      <div class="dialog-header">
        <AkDragHorizontalFill class="drag-handle"/>
      </div>
    </template>
    <div class="dialog-container">
      <!-- Phone screen with StreamH264Converter -->
      <div class="stream-screen">
        <!-- Stream content -->
        <StreamH264Converter
          ref="streamRef"
          :show="props.visible"
          :udid="props.device?.udid ?? ''"
          :playerName="props.device?.['ro.product.model'] ?? ''"
          :ws="props.wsUrl || (props.device?.udid ? getWsUrl(props.device.udid) : '')"
          @stream-stats="handleStreamStats"
        />
      </div>

      <!-- Control menu -->
      <div class="control-menu">
        <div>
          <!-- Header  -->
          <div class="control-header">
            <!-- Content header -->
            <div class="device-info">
              <span class="status-indicator"></span>
              <span class="device-name">{{
                props.device?.["ro.product.model"] || "Device"
              }}</span>
            </div>
            <CgClose class="close-button" @click="handleClose" />
          </div>

          <!-- Menu section -->
          <div class="menu-content">
            <div class="functions">
              <!-- Header -->
              <div class="functions-header">
                <span class="functions-title">Functions</span>

                <div class="functions-actions">
                  <BxLeftIndent class="action-icon" />
                  <AnOutlinedRotateRight class="action-icon" />
                  <AnOutlinedPushpin class="action-icon" />
                  <ChMenuMeatball class="action-icon" />
                </div>
              </div>
              <!-- List function -->

              <div class="functions-list">
                <div
                  v-for="(item, index) in functionItems"
                  :key="index"
                  :class="[
                    'function-item',
                    item.hasArrow && 'function-item-with-arrow',
                    item.isRed && 'function-item-red'
                  ]"
                  :style="item.isRed ? { color: 'red' } : {}"
                >
                  <template v-if="item.hasArrow">
                    <div class="function-content">
                      <component :is="item.icon" :class="item.isRed && 'icon-red'" />
                      <span>{{ item.label }}</span>
                    </div>
                    <AkChevronRightSmall />
                  </template>
                  <template v-else>
                    <component :is="item.icon" :class="item.isRed && 'icon-red'" />
                    <span :style="item.isRed ? { color: 'red' } : {}">{{ item.label }}</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Control device -->
         <div class="control-buttons">
          <ThControlStop @click="handleOverview" class="control-button"/> <!--Overview -->
          <ThControlRecord @click="handleHome" class="control-button"/> <!--Home -->
          <ThControlPlay @click="handleBack" class="control-button"/> <!--Back -->
         </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Dialog from "primevue/dialog";
import StreamH264Converter from "../views/StreamH264Converter.vue";
import { getWsUrl } from "../config/env";
import { CgClose } from "@kalimahapps/vue-icons";
import {
  ThControlStop,
  ThControlRecord,
  ThControlPlay,
  AkDragHorizontalFill,
} from "@kalimahapps/vue-icons";
import { BxLeftIndent } from "@kalimahapps/vue-icons";
import { MdRoundScreenRotation } from "@kalimahapps/vue-icons";
import { AnOutlinedPushpin } from "@kalimahapps/vue-icons";
import { ChMenuMeatball } from "@kalimahapps/vue-icons";
import { CdDebugRestart } from "@kalimahapps/vue-icons";
import { PhAndroidLogo } from "@kalimahapps/vue-icons";
import { ByImport } from "@kalimahapps/vue-icons";
import { ByExport } from "@kalimahapps/vue-icons";
import { AkClipboard } from "@kalimahapps/vue-icons";
import { CaLoadBalancerClassic } from "@kalimahapps/vue-icons";
import { AkChevronRightSmall } from "@kalimahapps/vue-icons";
import { MdOutlinedSwipe } from "@kalimahapps/vue-icons";
import { FlSlideRecord } from "@kalimahapps/vue-icons";
import { AnOutlinedPlayCircle } from "@kalimahapps/vue-icons";
import { BxTask } from "@kalimahapps/vue-icons";
import { AnOutlinedClose } from "@kalimahapps/vue-icons";
import { CaKeyboard } from "@kalimahapps/vue-icons";
import { CaPhraseSentiment } from "@kalimahapps/vue-icons";
import { AnOutlinedRotateRight } from "@kalimahapps/vue-icons";
import { KeyCodeControlMessage } from "../controlMessage/KeyCodeControlMessage";
import KeyEvent from "../controlMessage/KeyEvent";

// Export interfaces for library users
export interface Device {
  udid: string;
  pid?: number;
  state: string;
  "ro.product.manufacturer": string;
  "ro.product.model": string;
  "ro.build.version.release": string;
  "ro.build.version.sdk": string;
}

export interface AndroidDeviceDialogProps {
  visible: boolean;
  device: Device | null;
  wsUrl?: string;
  onUpdateStats?: (deviceId: string, stats: any) => void;
}

// Define props first
const props = defineProps<AndroidDeviceDialogProps>();
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
  (e: 'stream-stats', stats: any): void;
}>();

const streamRef = ref<InstanceType<typeof StreamH264Converter> | null>(null);

interface FunctionItem {
  icon: any;
  label: string;
  isRed?: boolean;
  hasArrow?: boolean;
  iconComponent?: any;
}

const functionItems: FunctionItem[] = [
  { icon: CdDebugRestart, label: 'Restart', isRed: true },
  { icon: PhAndroidLogo, label: 'Install APK' },
  { icon: ByImport, label: 'Import File' },
  { icon: ByExport, label: 'Export File' },
  { icon: AkClipboard, label: 'Export Clipboard' },
  { icon: CaLoadBalancerClassic, label: 'ADB', hasArrow: true },
  { icon: MdOutlinedSwipe, label: 'Auto Swipe' },
  { icon: FlSlideRecord, label: 'Action Record' },
  { icon: AnOutlinedPlayCircle, label: 'Execute Action' },
  { icon: BxTask, label: 'Execute Task' },
  { icon: AnOutlinedClose, label: 'End Task', isRed: true },
  { icon: CaKeyboard, label: 'Switch input Method' },
  { icon: CaPhraseSentiment, label: 'Quick Phrase' },
  { icon: MdRoundScreenRotation, label: 'Rotate Right' },
];

const handleVisibilityChange = (value: boolean) => {
  emit('update:visible', value);
};

const handleClose = () => {
  emit('close');
  emit('update:visible', false);
};

// Add debug log for stats
const handleStreamStats = (stats: any) => {
  emit('stream-stats', stats);
};

// Control handlers for Android navigation buttons
const handleOverview = () => {
  const message = new KeyCodeControlMessage(
    KeyEvent.ACTION_DOWN,
    KeyEvent.KEYCODE_APP_SWITCH,
    0,
    0
  );
  streamRef.value?.handleControlMessage(message);
};

const handleHome = () => {
  const message = new KeyCodeControlMessage(
    KeyEvent.ACTION_DOWN,
    KeyEvent.KEYCODE_HOME,
    0,
    0
  );
  streamRef.value?.handleControlMessage(message);
};

const handleBack = () => {
  const message = new KeyCodeControlMessage(
    KeyEvent.ACTION_DOWN,
    KeyEvent.KEYCODE_BACK,
    0,
    0
  );
  streamRef.value?.handleControlMessage(message);
};
</script>

<style>
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: white;
  width: 100%;
  height: 20px;
  padding: 0;
  margin-bottom: 6px;
  position: relative;
  z-index: 1;
  margin-right: 74px;
}

.drag-handle {
  font-size: 2rem;
  cursor: move;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.drag-handle:hover {
  opacity: 1;
}

.dialog-container {
  display: flex;
}

.stream-screen {
  background-color: black;
  border-radius: 1.6rem;
  overflow: hidden;
  margin-right: 0.75rem;
  border: 6px solid #1f2937;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.control-menu {
  width: 180px;
  background-color: white;
  border-radius: 0.75rem;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.control-header {
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #bee7c8;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: #22c55e;
}

.device-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #38b756;
}

.close-button {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  color: black
}

.menu-content {
  padding: 0.25rem;
}

.control-buttons {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #e5e7eb;
  align-items: center;
  gap: 0.5rem;
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
}

.control-button {
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  color: #555;
  padding: 0.375rem;
  transition: all 0.2s ease;
  
}

.control-button:hover {
  background-color: #d1d5db;
  border-radius: 9999px;
  transform: scale(1.3);
  padding: 0.375rem;
 

}

.stream-dialog {
  background-color: transparent !important;
  border: none !important;
  padding: 0 !important;
}

/* Functions component styles */
.functions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}

.functions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: black;
}

.functions-title {
  font-weight: 600;
  font-size: 14px;
}

.functions-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-icon {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.action-icon:hover {
  color: #4b5563;
}

.functions-list {
  display: flex;
  flex-direction: column;
}

.function-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem;
  cursor: pointer;
  border-radius: 0.25rem;
  color: #555;
}

.function-item:hover {
  background-color: #f3f4f6;
}

.function-item-with-arrow {
  justify-content: space-between;
}

.function-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-red {
  color: #f87171;
}

.function-item-red {
  color: #f87171;
}
</style>
