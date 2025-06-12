<template>
  <div class="stream-overlay">
    <div class="stream-container" :style="containerStyle">
      <StreamH264Converter
        ref="streamRef"
        :udid="udid"
        :playerName="playerName"
        :ws="wsUrl"
        :show="true"
        class="stream-content"
        @stream-stats="onStreamStats"
      />
      <button @click="$emit('close')" class="close-btn">
        × Close
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { 
  StreamH264Converter, 
  useStreamConfig, 
  useStreamControl,
  useStreamStats 
} from '../lib'

const props = defineProps({
  udid: String,
  playerName: String,
  wsUrl: String,
  width: {
    type: Number,
    default: 720
  },
  height: {
    type: Number,
    default: 720
  }
})

defineEmits(['close'])

// Sử dụng stream config
const { streamSettings, setBounds } = useStreamConfig()

// Cập nhật kích thước stream
setBounds(props.width, props.height)

// Sử dụng stream control
const { 
  isStreaming, 
  streamError, 
  streamRef,
  startStream, 
  stopStream 
} = useStreamControl({
  udid: props.udid,
  playerName: props.playerName,
  ws: props.wsUrl
})

// Test stream stats
const { deviceStats, updateStats, getDeviceStats, getFormattedNetworkSpeed } = useStreamStats();

// Log stats whenever they change
const onStreamStats = (newStats) => {
  if (!props.udid) return;
  
  updateStats(props.udid, newStats);
  
  const stats = getDeviceStats(props.udid);
  if (stats) {
    console.log(`Stream Stats for device ${props.udid}:`, {
      fps: stats.fps,
      networkSpeed: getFormattedNetworkSpeed(props.udid),
      timestamp: new Date(stats.timestamp).toLocaleTimeString()
    });
  }
};

// Style cho container
const containerStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`
}))

// Tự động start stream khi mounted
onMounted(() => {
  startStream()
})
</script>

<style scoped>
.stream-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.stream-container {
  position: relative;
  background: black;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  z-index: 1001;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>