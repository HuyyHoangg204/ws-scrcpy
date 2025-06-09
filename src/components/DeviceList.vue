<template>
  <main class="grid gap-3 mx-3 mt-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
    <div
      v-for="device in devices"
      :key="device.udid"
      @click="openDialog(device)"
      class="p-4 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div class="flex items-center gap-2">
        <div 
          class="w-3 h-3 rounded-full"
          :class="device.state === 'device' ? 'bg-green-500' : 'bg-red-500'"
        ></div>
        <span class="font-medium">{{ device["ro.product.model"] }}</span>
      </div>
      <div class="text-sm text-gray-600 mt-2">
        <div>{{ device["ro.product.manufacturer"] }}</div>
        <div>Android {{ device["ro.build.version.release"] }}</div>
        <div class="text-xs">{{ device.udid }}</div>
      </div>
    </div>

    <!-- Using the dialog from our library -->
    <AndroidDeviceDialog
      v-model:visible="visible"
      :device="currentDevice"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from 'vue'
import { AndroidDeviceDialog, config, setConfig, useAndroidDeviceDialog } from '../lib'

// Configure WebSocket settings
setConfig({
  host: 'localhost',
  port: 8000,
  secure: false,
})

// Log config to verify
console.log('Current WebSocket config:', config.ws)

// Use the composable from our library
const { visible, currentDevice, openDialog } = useAndroidDeviceDialog()

// Watch for dialog visibility changes
watch(visible, (newVal) => {
  console.log('Dialog visibility changed:', newVal)
  console.log('Current device:', currentDevice.value)
})

// Cleanup on unmount
onBeforeUnmount(() => {
  visible.value = false
  currentDevice.value = null
})

// Mock devices data
const devices = [
  {
    index: "01",
    udid: "fcd298c5",
    state: "device",
    "ro.product.manufacturer": "Samsung",
    "ro.product.model": "Galaxy S21 Ultra",
    "ro.build.version.release": "12",
    "ro.build.version.sdk": "31",
  },
  {
    index: "02",
    udid: "SM-S908B",
    state: "device",
    "ro.product.manufacturer": "Samsung",
    "ro.product.model": "Galaxy S22 Ultra",
    "ro.build.version.release": "13",
    "ro.build.version.sdk": "33",
  },
  {
    index: "03",
    udid: "SM-A536B",
    state: "disconnected",
    "ro.product.manufacturer": "Samsung",
    "ro.product.model": "Galaxy A53 5G",
    "ro.build.version.release": "13",
    "ro.build.version.sdk": "33",
  },
  // ... more devices can be added here
]
</script>

