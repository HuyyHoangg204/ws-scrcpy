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
      <!-- Hiển thị thông tin thiết bị và trạng thái kết nối -->
      <div
        class="flex items-center gap-3 border p-2 w-full rounded-lg border-[#e0e0e0] bg-[#f5f5f5] shadow-xl"
      >
        <!-- Đèn báo trạng thái kết nối: xanh = đã kết nối, đỏ = đã ngắt kết nối -->
        <div 
          :class="[
            'w-4 h-4 rounded-full',
            connectionState === 'device' ? 'bg-green-500' : 'bg-red-500'
          ]" 
          :title="connectionState"
        ></div>
        <div class="flex flex-col">
          <!-- Tên nhà sản xuất và model thiết bị -->
          <span class="text-xl font-semibold">
            {{ devices[0]?.['ro.product.manufacturer'] || 'No Device' }} 
            {{ devices[0]?.['ro.product.model'] || '' }}
          </span>
          <!-- Thông tin chi tiết thiết bị khi đã kết nối -->
          <span class="text-sm text-gray-500">
            <template v-if="connectionState === 'device'">
              {{ devices[0]?.udid }} | {{ devices[0]?.['ro.build.version.release'] }} | {{ devices[0]?.['ro.build.version.sdk'] }}
            </template>
            <template v-else>
              No device connected
            </template>
          </span>
        </div>
      </div>
    </div>

    <!-- Config Stream Device -->
    <div
      class="flex flex-col items-start justify-center w-2/3 bg-white rounded-lg p-6 space-y-10"
    >
      <!-- Danh sách công cụ -->
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

      <!-- Cấu hình kết nối -->
      <div class="flex items-center gap-6 ml-6">
        <select
          name=""
          id=""
          class="p-3 rounded-lg border border-[#cecece] bg-[#f5f5f5] text-md font-semibold cursor-pointer pr-2 shadow-xl"
        >
          <option value="">Proxy over adb</option>
          <option value="">Wlan:</option>
        </select>
        <!-- <div
          class="text-md font-semibold bg-red-400 text-white p-2 rounded-lg text-center shadow-xl"
        >
          Port: 3725
        </div> -->
      </div>

      <!-- Phương thức stream -->
      <div class="w-full flex items-center justify-around">
        <!-- Broadway -->
        <div
          
          :class="[
            'flex items-center gap-2 border py-3 rounded-lg border-[#e0e0e0] text-white w-1/5 justify-center cursor-pointer transition duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_30px_rgba(22,160,133,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:bg-gradient-to-br hover:from-[#48C9B0] hover:to-[#16A085]',
            connectionState === 'device' ? 'bg-[#1fa78c]' : 'bg-gray-400 cursor-not-allowed'
          ]"
          :disabled="connectionState !== 'device'"
        >
          <AnFilledStar class="w-6 h-6" />
          <span class="text-md font-semibold">Broadway</span>
        </div>
        <!-- H264 Converter -->
        <div
          @click="startH264Stream"
          :class="[
            'flex items-center gap-2 border py-3 rounded-lg border-[#e0e0e0] text-white w-1/5 justify-center cursor-pointer transition duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_30px_rgba(22,160,133,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:bg-gradient-to-br hover:from-[#48C9B0] hover:to-[#16A085]',
            connectionState === 'device' ? 'bg-[#1fa78c]' : 'bg-gray-400 cursor-not-allowed'
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
</template>

<script setup lang="ts">
import { BsTerminalFill } from "@kalimahapps/vue-icons";
import { onMounted, onUnmounted, ref } from "vue";
import { BsTools } from "@kalimahapps/vue-icons";
import { DeviceService } from "../../services/DeviceService";
import { AnFilledFolderOpen } from "@kalimahapps/vue-icons";
import { VsFileTypeLightConfig } from "@kalimahapps/vue-icons";
import { AnFilledStar } from "@kalimahapps/vue-icons";
import { useRouter } from 'vue-router';
import { ACTION } from '../../services/stream/StreamConnection';
import type { ScrcpyStreamParams } from '../../services/stream/StreamConnection';
import { PlayerType } from '../../services/stream/StreamConnection';
import { getWsUrl } from '../../config/env';

const router = useRouter();

// Interface định nghĩa cấu trúc thông tin mạng của thiết bị
interface NetworkInterface {
  name: string;
  ipv4: string;
}

// Interface định nghĩa cấu trúc thông tin thiết bị
interface Device {
  udid: string; // ID duy nhất của thiết bị
  pid?: number; // Process ID (tùy chọn)
  state: string; // Trạng thái thiết bị
  interfaces?: NetworkInterface[]; // Thông tin mạng (tùy chọn)
  "ro.product.manufacturer": string; // Nhà sản xuất
  "ro.product.model": string; // Model thiết bị
  "ro.build.version.release": string; // Phiên bản Android
  "ro.build.version.sdk": string; // SDK version
}

// Interface định nghĩa trạng thái thiết bị
interface DeviceState {
  devices: Device[]; // Danh sách thiết bị
  state: 'device' | 'disconnected'; // Trạng thái kết nối
}

// Khởi tạo các reactive references
const devices = ref<Device[]>([]); // Danh sách thiết bị
const connectionState = ref<string>('disconnected'); // Trạng thái kết nối
const isLoading = ref(false); // Trạng thái loading
const deviceService = new DeviceService(); // Khởi tạo service quản lý thiết bị
let cleanup: (() => void) | null = null; // Hàm cleanup

// Khởi tạo kết nối và đăng ký lắng nghe sự kiện khi component được mount
onMounted(() => {
  deviceService.connect(); // Kết nối WebSocket
  cleanup = deviceService.onDeviceList((data: DeviceState) => {
    
    devices.value = data.devices; // Cập nhật danh sách thiết bị
    connectionState.value = data.state; // Cập nhật trạng thái kết nối
  });
});

// Dọn dẹp khi component bị unmount
onUnmounted(() => {
  if (cleanup) {
    cleanup(); // Hủy đăng ký lắng nghe sự kiện
  }
  deviceService.disconnect(); // Ngắt kết nối WebSocket
});

// Hàm chung để start stream với player type khác nhau
const startStream = async (playerType: PlayerType) => {
  if (!devices.value[0] || connectionState.value !== 'device') {
    console.error('No device connected');
    return;
  }

  const udid = devices.value[0].udid;
  const wsUrl = getWsUrl(udid);
  
  const params: ScrcpyStreamParams = {
    action: ACTION.STREAM_SCRCPY,
    udid: udid,
    ws: wsUrl,
    player: playerType
  };


  await router.push({
    name: 'stream',
    params: { udid },
    query: {
      action: params.action,
      ws: params.ws,
      player: params.player
    }
  });
};

// Hàm xử lý cho từng nút

const startH264Stream = () => startStream(PlayerType.MSE);
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #2ecc71, #16a085);
  padding: 20px;
}
</style>
