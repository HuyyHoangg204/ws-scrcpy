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
            connectionState === 'device' ? 'bg-green-500' : 'bg-red-500',
          ]"
          :title="connectionState"
        ></div>
        <div class="flex flex-col">
          <!-- Tên nhà sản xuất và model thiết bị -->
          <span class="text-xl font-semibold">
            {{ devices[0]?.["ro.product.manufacturer"] || "No Device" }}
            {{ devices[0]?.["ro.product.model"] || "" }}
          </span>
          <!-- Thông tin chi tiết thiết bị khi đã kết nối -->
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


      <!-- Phương thức stream -->
      <div class="w-full flex items-center justify-around">
        <!-- Broadway -->
        <div
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

  <Dialog
    v-model:visible="visible"
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
  >
    <template #header>
      <div class="flex items-center justify-end gap-2 text-white mr-10" style=" width: 100%; height: 20px; padding: 0">
        <AkDragHorizontalFill class="text-4xl cursor-move"/>
      </div>
    </template>
    <div class="flex">
      <!-- Phone screen with StreamH264Converter -->
      <div
        class="bg-black rounded-4xl overflow-hidden mr-3 border-6 shadow-2xl"
      >
        <!-- Nội dung stream -->
        <StreamH264Converter
          ref="streamRef"
          :show="visible"
          :udid="devices[0]?.udid"
          :playerName="devices[0]?.['ro.product.model']"
          :ws="getWsUrl(devices[0]?.udid)"
        />
      </div>

      <!-- Control menu -->
      <div class="w-[180px] bg-white rounded-r-lg border-l border-gray-200 flex flex-col justify-between rounded-xl">
        <div >
          <!-- Header  -->
          <div
            class="p-2 border-b flex items-center justify-between bg-[#bee7c8] rounded-t-xl"
          >
            <!-- Nội dung header -->
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              <span class="text-md font-semibold text-[#38b756]">{{
                devices[0]?.["ro.product.model"] || "Device"
              }}</span>
            </div>
            <CgClose class="w-4 h-4 cursor-pointer" @click="visible = false" />
          </div>

          <!-- Phần menu -->
          <div class="p-1">
            <Functions/>
          </div>
        </div>
        <!-- Control device -->
         <div class="flex justify-between px-4 py-2 bg-gray-200 items-center gap-2 rounded-b-xl">
          <ThControlStop @click="handleOverview" class="w-6 h-6 cursor-pointer hover:bg-gray-300 rounded-full "/> <!--Overview -->
          <ThControlRecord @click="handleHome" class="w-6 h-6 cursor-pointer hover:bg-gray-300 rounded-full"/> <!--Home -->
          <ThControlPlay @click="handleBack" class="w-6 h-6 cursor-pointer hover:bg-gray-300 rounded-full"/> <!--Back -->
         </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { BsTerminalFill } from "@kalimahapps/vue-icons";
import Dialog from "primevue/dialog";
import StreamH264Converter from "../../views/StreamH264Converter.vue";
import { onMounted, onUnmounted, ref } from "vue";
import { KeyCodeControlMessage } from "@/controlMessage/KeyCodeControlMessage";
import { BsTools } from "@kalimahapps/vue-icons";
import { DeviceService } from "../../services/DeviceService";
import { AnFilledFolderOpen } from "@kalimahapps/vue-icons";
import { VsFileTypeLightConfig } from "@kalimahapps/vue-icons";
import { AnFilledStar } from "@kalimahapps/vue-icons";
import { getWsUrl } from "../../config/env";
import { CgClose } from "@kalimahapps/vue-icons";
import { ThControlStop } from '@kalimahapps/vue-icons';
import { ThControlRecord } from '@kalimahapps/vue-icons';
import { ThControlPlay } from '@kalimahapps/vue-icons';
import KeyEvent from "@/controlMessage/KeyEvent";
import { defineEmits } from 'vue';
import { AkDragHorizontalFill } from '@kalimahapps/vue-icons';
import Functions from "../controlStream/Functions.vue";


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
  state: "device" | "disconnected"; // Trạng thái kết nối
}

// Khởi tạo các reactive references
const devices = ref<Device[]>([]); // Danh sách thiết bị
const connectionState = ref<string>("disconnected"); // Trạng thái kết nối
const visible = ref(false); // Trạng thái visible

const isLoading = ref(false); // Trạng thái loading
const deviceService = new DeviceService(); // Khởi tạo service quản lý thiết bị
let cleanup: (() => void) | null = null; // Hàm cleanup

const streamRef = ref<InstanceType<typeof StreamH264Converter> | null>(null);

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



// Hàm xử lý cho từng nút
// Emit events để StreamH264Converter xử lý
const emit = defineEmits<{
  (e: 'control-event', message: KeyCodeControlMessage): void
}>();

// Control handlers cho 3 nút Android navigation
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


// const startH264Stream = () => startStream(PlayerType.MSE);
const startH264Click = () => {
  visible.value = true;
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

:deep(.p-dialog) {
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
}
</style>
