<template>
  <div class="device-view">
    <!-- Control buttons từ GoogToolBox -->
    <!-- <div class="control-buttons" ref="controlButtons">
      <button class="action-button" @click="stop">Stop</button>
    </div> -->

    <!-- Video container -->
    <div class="video" ref="videoContainer">
      <!-- Video element sẽ được tạo và quản lý bởi MsePlayer -->
    </div>

    <!-- More box từ GoogMoreBox -->
    <div class="more-box" ref="moreBox"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { MsePlayer } from '../player/MsePlayer';
import { StreamReceiverScrcpy } from '../services/stream/StreamReceiverScrcpy';
import VideoSettings from '../utils/VideoSettings';
import Size from '../utils/Size';
import { DisplayInfo } from '../utils/DisplayInfo';
import DeviceMessage from '../packages/DeviceMessage';
import { ControlMessage } from '../controlMessage/ControlMessage';
import { ACTION } from '@/common/Action';

// Props & Refs
const props = defineProps<{
  udid: string;
  playerName: string;
  ws: string;
}>();

const videoContainer = ref<HTMLDivElement | null>(null);
const controlButtons = ref<HTMLDivElement | null>(null);
const moreBox = ref<HTMLDivElement | null>(null);

// State
const deviceName = ref('');
const clientId = ref(-1);
const clientsCount = ref(-1);
const joinedStream = ref(false);
let player: MsePlayer | null = null;
let streamReceiver: StreamReceiverScrcpy | null = null;
let requestedVideoSettings: VideoSettings | undefined;
let fitToScreen: boolean | undefined;

// Event handlers
const onVideo = (data: ArrayBuffer) => {
  if (!player) {
    console.error('StreamH264Converter: Player not initialized');
    return;
  }
  
  const STATE = MsePlayer.STATE;
  if (player.getState() === STATE.PAUSED) {
    player.play();
  }
  if (player.getState() === STATE.PLAYING) {
    player.pushFrame(new Uint8Array(data));
  }
};

const onClientsStats = (stats: { deviceName: string; clientId: number }) => {
  deviceName.value = stats.deviceName;
  clientId.value = stats.clientId;
  document.title = `Stream ${deviceName.value}`;
};

const onDeviceMessage = (message: DeviceMessage) => {
  // Handle device messages
};

const onDisplayInfo = (infoArray: Array<{
  displayInfo: DisplayInfo;
  videoSettings?: VideoSettings;
  screenInfo?: any;
  connectionCount: number;
}>) => {
  if (!player) return;

  let currentSettings = player.getVideoSettings();
  const displayId = currentSettings.displayId;
  const info = infoArray.find(value => value.displayInfo.displayId === displayId);
  if (!info) return;

  if (player.getState() === MsePlayer.STATE.PAUSED) {
    player.play();
  }

  const { videoSettings, screenInfo } = info;
  player.setDisplayInfo(info.displayInfo);

  // ... rest of display info handling logic
};

const onDisconnected = () => {
  if (!streamReceiver) return;
  
  streamReceiver.off('deviceMessage', onDeviceMessage);
  streamReceiver.off('video', onVideo);
  streamReceiver.off('clientsStats', onClientsStats);
  streamReceiver.off('displayInfo', onDisplayInfo);
  streamReceiver.off('disconnected', onDisconnected);
};

const stop = () => {
  // First cleanup video element
  player?.cleanup();
  
  // Then stop stream and player
  streamReceiver?.stop();
  player?.stop();
  
  // Finally clean up references
  streamReceiver = null;
  player = null;
};

// Methods
const startStream = async () => {
  console.log('StreamH264Converter: Starting stream setup');
  if (!props.udid) {
    throw Error(`Invalid udid value: "${props.udid}"`);
  }

  // Create player instance
  player = new MsePlayer(props.udid);
  
  // Lấy video settings từ player
  const videoSettings = player.getVideoSettings();
  
  // Create stream receiver
  const receiverParams = {
    udid: props.udid,
    ws: props.ws,
    player: props.playerName,
    action: ACTION.STREAM_SCRCPY as const,
    videoSettings,
    fitToScreen: true
  };
  
  streamReceiver = new StreamReceiverScrcpy(receiverParams);
  
  // Add more logging
  streamReceiver.on('connected', () => {
    console.log('WebSocket connection opened');
  });

  // Setup other event listeners
  streamReceiver.on('deviceMessage', onDeviceMessage);
  streamReceiver.on('video', onVideo);
  streamReceiver.on('clientsStats', onClientsStats);
  streamReceiver.on('displayInfo', onDisplayInfo);
  streamReceiver.on('disconnected', onDisconnected);

  
};

const sendMessage = (message: ControlMessage) => {
  streamReceiver?.sendEvent(message);
};

// Lifecycle
onMounted(() => {
  startStream();
  document.body.className = 'stream';
});

onUnmounted(() => {
  stop();
});

// Expose necessary methods
defineExpose({
  sendMessage,
  getDeviceName: () => deviceName.value,
  getClientId: () => clientId.value,
  getClientsCount: () => clientsCount.value
});
</script>

<!-- <style scoped>
.device-view {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.control-buttons {
  position: relative;
  z-index: 2;
}

.video {
  flex: 1;
  position: relative;
  background: #000;
}

.action-button {
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button:hover {
  background: #e0e0e0;
}
</style> -->