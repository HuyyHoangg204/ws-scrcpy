<!-- src/components/DeviceList.vue -->
<template>
  <div
    id="container"
    class="w-screen h-screen app-container flex flex-col items-center justify-center space-y-10"
  >
    <!-- Logo and name device -->
    <div
      class="flex flex-col items-start justify-center w-2/3 bg-white rounded-lg p-6 space-y-10"
    >
      <!-- Logo -->
      <div class="flex items-center justify-center gap-4">
        <img src="../../assets/logo.png" alt="logo" class="w-20 h-20" />
        <h1 class="text-4xl font-bold text-green-500">One Green</h1>
      </div>
      <!-- Display device information and connection status -->
      <div
        class="flex items-center gap-3 border p-2 w-full rounded-lg border-[#e0e0e0] bg-[#f5f5f5] shadow-xl"
      >
        <!-- Connection status indicator: green = connected, red = disconnected -->
        <div
          :class="[
            'w-4 h-4 rounded-full',
            connectionState === 'device' ? 'bg-green-500' : 'bg-red-500',
          ]"
          :title="connectionState"
        ></div>
        <div class="flex flex-col">
          <!-- Manufacturer name and device model -->
          <span class="text-xl font-semibold">
            {{ devices[0]?.["ro.product.manufacturer"] || "No Device" }}
            {{ devices[0]?.["ro.product.model"] || "" }}
          </span>
          <!-- Detailed device information when connected -->
          <span class="text-sm text-gray-500">
            <template v-if="connectionState === 'device'">
              {{ devices[0]?.udid }} |
              {{ devices[0]?.["ro.build.version.release"] }} |
              {{ devices[0]?.["ro.build.version.sdk"] }}
            </template>
            <template v-else> No device connected </template>
          </span>
        </div>
      </div>
    </div>

    <!-- Config Stream Device -->
    <div
      class="flex flex-col items-start justify-center w-2/3 bg-white rounded-lg p-6 space-y-10"
    >
      <!-- Tools list -->
      <div class="w-full flex items-center gap-2 justify-around">
        <!-- Shell terminal -->
        <div
          class="flex items-center gap-2 border p-4 rounded-lg border-[#e0e0e0] bg-[#f5f5f5] w-1/5 justify-center cursor-pointer hover:bg-[#d7eee6] hover:border-[#2ecc71] hover:-translate-y-1 hover:shadow-lg hover:transition-all hover:duration-300"
        >
          <BsTerminalFill class="w-6 h-6" />
          <span class="text-xl font-semibold">Shell</span>
        </div>
        <!-- Devtools -->
        <div
          class="flex items-center gap-2 border p-4 rounded-lg border-[#e0e0e0] bg-[#f5f5f5] w-1/5 justify-center cursor-pointer hover:bg-[#d7eee6] hover:border-[#2ecc71] hover:-translate-y-1 hover:shadow-lg hover:transition-all hover:duration-300"
        >
          <BsTools class="w-6 h-6" />
          <span class="text-xl font-semibold">Devtools</span>
        </div>
        <!-- Devtools -->
        <div
          class="flex items-center gap-2 border p-4 rounded-lg border-[#e0e0e0] bg-[#f5f5f5] w-1/5 justify-center cursor-pointer hover:bg-[#d7eee6] hover:border-[#2ecc71] hover:-translate-y-1 hover:shadow-lg hover:transition-all hover:duration-300"
        >
          <AnFilledFolderOpen class="w-6 h-6" />
          <span class="text-xl font-semibold">List file</span>
        </div>
        <!-- Stream configuration -->
        <div
          class="flex items-center gap-2 border p-4 rounded-lg border-[#e0e0e0] bg-[#f5f5f5] w-1/5 justify-center cursor-pointer hover:bg-[#d7eee6] hover:border-[#2ecc71] hover:-translate-y-1 hover:shadow-lg hover:transition-all hover:duration-300"
        >
          <VsFileTypeLightConfig class="w-6 h-6" />
          <span class="text-xl font-semibold">Configure stream</span>
        </div>
      </div>


      <!-- Stream method -->
      <div class="w-full flex items-center justify-around">
        <!-- Broadway -->
        <div
          @click="startBroadwayClick"
          :class="[
            'flex items-center gap-2 border py-3 rounded-lg border-[#e0e0e0] text-white w-1/5 justify-center cursor-pointer transition duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_30px_rgba(22,160,133,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:bg-gradient-to-br hover:from-[#48C9B0] hover:to-[#16A085]',
            connectionState === 'device'
              ? 'bg-[#1fa78c]'
              : 'bg-gray-400 cursor-not-allowed',
          ]"
          :disabled="connectionState !== 'device'"
        >
          <AnFilledStar class="w-6 h-6" />
          <span class="text-md font-semibold">Broadway</span>
        </div>
        <!-- H264 Converter -->
        <div
          @click="startH264Click"
          :class="[
            'flex items-center gap-2 border py-3 rounded-lg border-[#e0e0e0] text-white w-1/5 justify-center cursor-pointer transition duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_30px_rgba(22,160,133,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:bg-gradient-to-br hover:from-[#48C9B0] hover:to-[#16A085]',
            connectionState === 'device'
              ? 'bg-[#1fa78c]'
              : 'bg-gray-400 cursor-not-allowed',
          ]"
          :disabled="connectionState !== 'device'"
        >
          <AnFilledStar class="w-6 h-6" />
          <span class="text-md font-semibold">H264 Converter</span>
        </div>

        <!-- Tiny H264 -->
        <div
          class="flex items-center gap-2 border py-3 rounded-lg bg-[#1fa78c] border-[#e0e0e0] text-white w-1/5 justify-center cursor-pointer transition duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_30px_rgba(22,160,133,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:bg-gradient-to-br hover:from-[#48C9B0] hover:to-[#16A085]"
        >
          <AnFilledStar class="w-6 h-6" />
          <span class="text-md font-semibold">Tiny H264</span>
        </div>

        <!-- WebCodes -->
        <div
          class="flex items-center gap-2 border py-3 rounded-lg bg-[#1fa78c] border-[#e0e0e0] text-white w-1/5 justify-center cursor-pointer transition duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_30px_rgba(22,160,133,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:bg-gradient-to-br hover:from-[#48C9B0] hover:to-[#16A085]"
        >
          <AnFilledStar class="w-6 h-6" />
          <span class="text-md font-semibold">WebCodes</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Dialog stream -->
  <AndroidDeviceDialog
    v-model:visible="visible"
    :device="devices[0]"
    :wsUrl="getWsUrl(devices[0]?.udid)"
    @close="closeDialog"
  />

  <!-- Test Stream Component -->
  <TestStream
    v-if="showStream"
    :udid="devices[0]?.udid"
    :playerName="devices[0]?.['ro.product.model']"
    :wsUrl="getWsUrl(devices[0]?.udid)"
    :width="112"
    :height="240"
    @close="closeStream"
  />
</template>

<script setup lang="ts">
import { BsTerminalFill } from "@kalimahapps/vue-icons";
import { onMounted, onUnmounted, ref } from "vue";
import { BsTools } from "@kalimahapps/vue-icons";
import { DeviceService } from "../../services/DeviceService";
import { AnFilledFolderOpen } from "@kalimahapps/vue-icons";
import { VsFileTypeLightConfig } from "@kalimahapps/vue-icons";
import { AnFilledStar } from "@kalimahapps/vue-icons";
import { getWsUrl } from "../../config/env";
import AndroidDeviceDialog from "../AndroidDeviceDialog.vue";
import TestStream from "../TestStream.vue";

// Interface defining device network information structure
interface NetworkInterface {
  name: string;
  ipv4: string;
}

// Interface defining device information structure
interface Device {
  udid: string; // Unique device ID
  pid?: number; // Process ID (optional)
  state: string; // Device state
  interfaces?: NetworkInterface[]; // Network information (optional)
  "ro.product.manufacturer": string; // Manufacturer
  "ro.product.model": string; // Device model
  "ro.build.version.release": string; // Android version
  "ro.build.version.sdk": string; // SDK version
}

// Interface defining device status
interface DeviceState {
  devices: Device[]; // Device list
  state: "device" | "disconnected"; // State connection
}

// Initialize reactive references
const devices = ref<Device[]>([]); // Device list
const connectionState = ref<string>("disconnected"); // Connection state
const visible = ref(false); // Visibility state for dialog
const showStream = ref(false); // Visibility state for stream

const deviceService = new DeviceService(); // Initialize device service
let cleanup: (() => void) | null = null; // cleanup method

// Initialize connection and register event when component is mounted
onMounted(() => {
  deviceService.connect(); // Connect WebSocket
  cleanup = deviceService.onDeviceList((data: DeviceState) => {
    devices.value = data.devices; // Update device list
    console.log(devices.value[0]);
    connectionState.value = data.state; // Update connection state
  });
});

// Cleanup when component is unmounted
onUnmounted(() => {
  if (cleanup) {
    cleanup(); // Cleanup event listeners
  }
  deviceService.disconnect(); // Disconnect WebSocket
});

// Start Broadway stream
const startBroadwayClick = () => {
  if (connectionState.value === 'device' && devices.value[0]) {
    showStream.value = true;
    visible.value = false; // Hide dialog if it's open
  } else {
    console.log("no device connected");
  }
};

// Start H264 stream
const startH264Click = () => {
  if (connectionState.value === 'device' && devices.value[0]) {
    visible.value = true;
    showStream.value = false; // Hide stream if it's open
  } else {
    console.log("no device connected");
  }
};

// Close dialog stream
const closeDialog = () => {
  visible.value = false;
};

// Close stream
const closeStream = () => {
  showStream.value = false;
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #2ecc71, #16a085);
  padding: 20px;
}

.phone-frame {
  aspect-ratio: 9/20;
  width: 100%;
  background: black;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  padding: 0;
}

/* :deep(.p-dialog) {
  margin: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
}

::v-deep(.stream-dialog .p-dialog-content) {
  background-color: transparent !important;
  padding: 0 !important;
}

:deep(.p-dialog-mask) {
  backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.4);
} */
</style>
