<template>
  <div class="device-view">
    <!-- Video container -->
    <div class="video" ref="videoContainer" @control-event="handleControlEvent">
      <!-- Video element sẽ được tạo và quản lý bởi MsePlayer -->
    </div>

    <!-- More box từ GoogMoreBox -->
    <div class="more-box" ref="moreBox"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { MsePlayer } from "../player/MsePlayer";
import { StreamReceiverScrcpy } from "../services/stream/StreamReceiverScrcpy";
import { CommandControlMessage } from "../controlMessage/CommandControlMessage";
import VideoSettings from "../utils/VideoSettings";
import Size from "../utils/Size";
import { DisplayInfo } from "../utils/DisplayInfo";
import DeviceMessage from "../packages/DeviceMessage";
import { ControlMessage } from "../controlMessage/ControlMessage";
import { FeaturedInteractionHandler } from "@/interactionHandler/FeaturedInteractionHandler";
import type { KeyEventListener } from "@/utils/KeyInputHandler";
import { ACTION } from "@/common/Action";
import type {
  ClientsStats,
  DisplayCombinedInfo,
} from "@/services/stream/StreamReceiver";
import type { BasePlayer } from "@/player/BasePlayer";
import Point from "@/utils/Point";
import { KeyInputHandler } from "@/utils/KeyInputHandler";
import { KeyCodeControlMessage } from "@/controlMessage/KeyCodeControlMessage";
import { getWsUrl } from "../config/env";
import KeyEvent from "@/controlMessage/KeyEvent";

type StartParams = {
  udid: string;
  playerName?: string;
  player?: BasePlayer;
  fitToScreens?: boolean;
  videoSettings?: VideoSettings;
};

// Props & Refs
const props = defineProps<{
  udid: string;
  playerName: string;
  ws: string;
  show: boolean;
}>();

const emit = defineEmits(['update:show']);

const videoContainer = ref<HTMLDivElement | null>(null);
const controlButtons = ref<HTMLDivElement | null>(null);
const moreBox = ref<HTMLDivElement | null>(null);

// State
const deviceName = ref("");
const clientId = ref(-1);
const clientsCount = ref(-1);
const joinedStream = ref(false);
let touchHandler: FeaturedInteractionHandler | null = null;
let player: MsePlayer | null = null;
let streamReceiver: StreamReceiverScrcpy | null = null;
let requestedVideoSettings: VideoSettings | undefined;
let fitToScreen: boolean | undefined;
let keyboardEnabled = ref(false);



// Thêm handler để xử lý control event
const handleControlEvent = (message: KeyCodeControlMessage) => {
  // Kiểm tra nếu streamReceiver đã được khởi tạo
  if (!streamReceiver) return;

  // Gửi message thông qua streamReceiver
  streamReceiver.sendEvent(message);

  // Sau khi gửi ACTION_DOWN, cần gửi thêm ACTION_UP
  const upMessage = new KeyCodeControlMessage(
    KeyEvent.ACTION_UP,
    message.keycode,
    0,
    0
  );
  streamReceiver.sendEvent(upMessage);
};

//Xác định xem video stream có được co giãn để vừa với kích thước màn hình không
const getFitToScreen = (udid: string, displayInfo?: DisplayInfo) => {
  return MsePlayer.getFitToScreenStatus(udid, displayInfo);
};

// Event handlers
const onVideo = (data: ArrayBuffer) => {
  if (!player) {
    return;
  }

  try {
    const STATE = MsePlayer.STATE;

    if (player.getState() === STATE.PAUSED) {
      player.play();
    }
    if (player.getState() === STATE.PLAYING) {
      player.pushFrame(new Uint8Array(data));
    }
  } catch (error) {
    console.error("Error processing video frame:", error);
  }
};

const onClientsStats = (stats: ClientsStats) => {
  deviceName.value = stats.deviceName;
  clientId.value = stats.clientId;
  document.title = `Stream ${deviceName.value}`;
};

const onDeviceMessage = (message: DeviceMessage) => {
  console.log("Device message received:", message);
};

const onDisplayInfo = (infoArray: DisplayCombinedInfo[]) => {
  if (!player) return;

  let currentSettings = player.getVideoSettings();
  const displayId = currentSettings.displayId;
  const info = infoArray.find(
    (value) => value.displayInfo.displayId === displayId
  );
  if (!info) return;

  if (player.getState() === MsePlayer.STATE.PAUSED) {
    player.play();
  }

  const { videoSettings, screenInfo } = info;
  player.setDisplayInfo(info.displayInfo);

  if (typeof fitToScreen !== "boolean") {
    fitToScreen = player.getFitToScreenStatus();
  }
  if (fitToScreen) {
    const newBounds = getMaxSize();

    if (newBounds) {
      currentSettings = createVideoSettingsWithBounds(
        currentSettings,
        newBounds
      );
      player.setVideoSettings(currentSettings, fitToScreen, false);
    }
  }

  if (!videoSettings || !screenInfo) {
    joinedStream.value = true;
    sendMessage(
      CommandControlMessage.createSetVideoSettingsCommand(currentSettings)
    );
    return;
  }
  clientsCount.value = info.connectionCount;
  let min = VideoSettings.copy(videoSettings);
  const oldInfo = player.getScreenInfo();
  if (!screenInfo.equals(oldInfo)) {
    player.setScreenInfo(screenInfo);
  }
  if (!videoSettings.equals(currentSettings)) {
    applyNewVideoSettings(
      videoSettings,
      videoSettings.equals(requestedVideoSettings)
    );
  }

  if (!oldInfo) {
    const bounds = currentSettings.bounds;
    const videoSize: Size = screenInfo.videoSize;
    const onlyOneClient = clientsCount.value === 0;
    const smallerThenCurrent =
      bounds &&
      (bounds.width < videoSize.width || bounds.height < videoSize.height);
    if (onlyOneClient || smallerThenCurrent) {
      min = currentSettings;
    }
    const minBounds = currentSettings.bounds?.intersect(min.bounds);
    if (minBounds && !minBounds.equals(min.bounds)) {
      min = createVideoSettingsWithBounds(min, minBounds);
    }

    if (!min.equals(videoSettings) || !joinedStream) {
      joinedStream.value = true;
      sendMessage(CommandControlMessage.createSetVideoSettingsCommand(min));
    }
  }
};

const createVideoSettingsWithBounds = (
  old: VideoSettings,
  newBounds: Size
): VideoSettings => {
  return new VideoSettings({
    crop: old.crop,
    bitrate: old.bitrate,
    bounds: newBounds,
    maxFps: old.maxFps,
    iFrameInterval: old.iFrameInterval,
    sendFrameMeta: old.sendFrameMeta,
    lockedVideoOrientation: old.lockedVideoOrientation,
    displayId: old.displayId,
    codecOptions: old.codecOptions,
    encoderName: old.encoderName,
  });
};

const applyNewVideoSettings = (
  videoSettings: VideoSettings,
  saveToStorage: boolean
) => {
  let fitToScreen = false;

  // TODO: create control (switch/checkbox) instead
  if (videoSettings.bounds && videoSettings.bounds.equals(getMaxSize())) {
    fitToScreen = true;
  }
  if (player) {
    player.setVideoSettings(videoSettings, fitToScreen, saveToStorage);
  }
};

const getMaxSize = (): Size => {
  if (!controlButtons.value) {
    // If controlButtons is not available, use full body dimensions
    const body = document.body;
    const width = body.clientWidth & ~15;
    const height = body.clientHeight & ~15;
    return new Size(width, height);
  }

  // If controlButtons exists, subtract its width
  const body = document.body;
  const width = (body.clientWidth - controlButtons.value.clientWidth) & ~15;
  const height = body.clientHeight & ~15;
  return new Size(width, height);
};

const onDisconnected = () => {
  console.log("Stream disconnected");
  if (!streamReceiver) return;

  streamReceiver.off("deviceMessage", onDeviceMessage);
  streamReceiver.off("video", onVideo);
  streamReceiver.off("clientsStats", onClientsStats);
  streamReceiver.off("displayInfo", onDisplayInfo);
  streamReceiver.off("disconnected", onDisconnected);

  // TODO
};

const stop = () => {
  // Cleanup theo thứ tự
  touchHandler?.release(); // Thêm cleanup touch handler
  touchHandler = null;

  player?.cleanup();
  streamReceiver?.stop();
  player?.stop();

  streamReceiver = null;
  player = null;
};

onUnmounted(() => {
  stop();
  document.body.classList.remove("stream"); // Cleanup body class
});

// Keyboard event handling
const setHandleKeyboardEvents = (enabled: boolean) => {
  if (!player) return;
  
  keyboardEnabled.value = enabled;
  const listener: KeyEventListener = {
    onKeyEvent: (event: KeyCodeControlMessage) => {
      sendMessage(event);
    }
  };

  if (enabled) {
    KeyInputHandler.addEventListener(listener);
  } else {
    KeyInputHandler.removeEventListener(listener);
  }
};

const setTouchListeners = (player: BasePlayer) => {
  if (touchHandler) {
    touchHandler.release();
    touchHandler = null;
  }
  touchHandler = new FeaturedInteractionHandler(player, {
    sendMessage: (message: ControlMessage) => {
      streamReceiver?.sendEvent(message);
    },
  });

  // Force draw a test point to verify canvas is working
  if (touchHandler) {
    const testPoint = new Point(100, 100);
    touchHandler.drawPointer(testPoint);
  }
};

// Đăng ký listeners sau khi khởi tạo streamReceiver
const setupEventListeners = () => {
  if (!streamReceiver) {
    console.error("Cannot setup listeners - streamReceiver not initialized");
    return;
  }

  console.log("Setting up event listeners...");

  // Remove existing listeners first to prevent duplicates
  streamReceiver.off("deviceMessage", onDeviceMessage);
  streamReceiver.off("video", onVideo);
  streamReceiver.off("clientsStats", onClientsStats);
  streamReceiver.off("displayInfo", onDisplayInfo);
  streamReceiver.off("disconnected", onDisconnected);

  // Add listeners
  streamReceiver.on("deviceMessage", onDeviceMessage);
  streamReceiver.on("video", onVideo);
  streamReceiver.on("clientsStats", onClientsStats);
  streamReceiver.on("displayInfo", onDisplayInfo);
  streamReceiver.on("disconnected", onDisconnected);

  console.log("Event listeners setup completed");
};

// appen touchablec canvas vào DOM
const setParent = (parent: HTMLElement) => {
  if (!player) return;
  
  // Lưu parent element
  player.setParent(parent);
}
// Methods
const startStream = ({
  udid,
  playerName,
  player,
  videoSettings,
  fitToScreens,
}: StartParams) => {
  if (!udid) {
    throw Error(`Invalid udid value: "${udid}"`);
  }
  fitToScreen = fitToScreens;
  if (player) {
    setTouchListeners(player);
  }
  if (!videoSettings) {
    videoSettings = player?.getVideoSettings();
  }
  // TOdo: morebox
  if (fitToScreen && videoSettings) {
    const newBounds = getMaxSize();
    if (newBounds) {
      videoSettings = createVideoSettingsWithBounds(videoSettings, newBounds);
    }
  }
  if (videoSettings) {
    applyNewVideoSettings(videoSettings, false);
  }
  setupEventListeners();
};

const sendMessage = (message: ControlMessage) => {
  streamReceiver?.sendEvent(message);
};

// Methods to handle controls
const handleControlMessage = (message: KeyCodeControlMessage) => {
  if (!streamReceiver) return;
  
  // Send DOWN action
  streamReceiver.sendEvent(message);
  
  // Send UP action
  const upMessage = new KeyCodeControlMessage(
    KeyEvent.ACTION_UP,
    message.keycode,
    0,
    0
  );
  streamReceiver.sendEvent(upMessage);
};

// Lifecycle
onMounted(() => {
  // 1. Khởi tạo video element
  const videoElement = MsePlayer.createElement();
  videoContainer.value?.appendChild(videoElement);

  // 2. Lấy fitToScreen status trước
  fitToScreen = MsePlayer.getFitToScreenStatus(props.udid);

  // 3. Khởi tạo video settings với bounds phù hợp
  const currentSettings = new VideoSettings({
    lockedVideoOrientation: -1,
    bitrate: 7340032,  // ~7MB/s
    maxFps: 60,
    iFrameInterval: 10,
    bounds: new Size(720, 720),
    sendFrameMeta: false
  });

  const displayInfo = new DisplayInfo(
    DisplayInfo.DEFAULT_DISPLAY,
    new Size(1080, 1920),
    0,
    0,
    0
  );

  // 4. Khởi tạo player với settings
  const currentPlayer = new MsePlayer(
    props.udid,
    displayInfo,
    MsePlayer.playerFullName,
    videoElement
  );
  player = currentPlayer;
  player.setVideoSettings(currentSettings, fitToScreen, false);

   // Dùng setParent để append cả video và canvas
   if (videoContainer.value) {
    setParent(videoContainer.value);
  }

  // 5. Khởi tạo stream receiver
  streamReceiver = new StreamReceiverScrcpy({
    udid: props.udid,
    ws: getWsUrl(props.udid),
    player: props.playerName,
    action: ACTION.STREAM_SCRCPY,
    videoSettings: currentSettings,
    fitToScreen: fitToScreen,
  });


  // 6. Đăng ký event listeners
  setupEventListeners();

  // 7. Setup touch và start stream
  setTouchListeners(player);

  setHandleKeyboardEvents(true)
  startStream({
    udid: props.udid,
    playerName: props.playerName,
    player: currentPlayer,
    videoSettings: currentSettings,
    fitToScreens: fitToScreen,
  });

  // 8. Start player
  player.play();

  document.body.className = "stream";
});

// Expose necessary methods
defineExpose({
  sendMessage,
  handleControlMessage,
  getDeviceName: () => deviceName.value,
  getClientId: () => clientId.value,
  getClientsCount: () => clientsCount.value,
});

const closeModal = () => {
  stop(); // Stop the stream
  emit('update:show', false);
};
</script>

<style scoped>
.device-view {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: black;
}

/* Thêm style cho touch layer */
:deep(.touch-layer) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: auto; /* Canvas nhận events */
  touch-action: none;
  background: transparent; /* Đảm bảo canvas trong suốt */
}

.video {
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: none;
}

.video video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none; /* Video KHÔNG nhận events */
}
</style>