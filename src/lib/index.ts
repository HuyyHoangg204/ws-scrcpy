import { App, ref, onUnmounted } from 'vue'
import AndroidDeviceDialog from '../components/AndroidDeviceDialog.vue'
import { setConfig, config, type WsConfig, getBaseWsUrl, getWsUrl, getMultiplexWsUrl, getActionWsUrl } from '../config/env'
import { DeviceService } from '../services/DeviceService'
import  StreamH264Converter  from '../views/StreamH264Converter.vue'
import  VideoSettings  from '../utils/VideoSettings'
import  Size  from '../utils/Size'
import  {DisplayInfo}  from '../utils/DisplayInfo'

// Export interfaces
export interface NetworkInterface {
  name: string;
  ipv4: string;
}

export interface Device {
  udid: string;
  pid?: number;
  state: string;
  interfaces?: NetworkInterface[];
  "ro.product.manufacturer": string;
  "ro.product.model": string;
  "ro.build.version.release": string;
  "ro.build.version.sdk": string;
}

export interface DeviceState {
  devices: Device[];
  state: "device" | "disconnected";
}

// Export types
export type { WsConfig }

// Export WebSocket configuration
export { config, setConfig, getBaseWsUrl, getWsUrl, getMultiplexWsUrl, getActionWsUrl }
export { VideoSettings, Size, DisplayInfo }

// Export components
export { AndroidDeviceDialog }
export {StreamH264Converter}

// Export services
export { DeviceService }

// Plugin installation
export default {
  install: (app: App) => {
    app.component('AndroidDeviceDialog', AndroidDeviceDialog)
  }
}

// Export composable for managing dialog state
export const useAndroidDeviceDialog = () => {
  const visible = ref(false)
  const currentDevice = ref<Device | null>(null)

  const openDialog = (device: Device) => {
    console.log('Opening dialog for device:', device);
    currentDevice.value = device
    visible.value = true
    console.log('Dialog visibility should be true:', visible.value);
  }

  const closeDialog = () => {
    visible.value = false
    currentDevice.value = null
  }

  return {
    visible,
    currentDevice,
    openDialog,
    closeDialog
  }
}

// Export composable for stream configuration
export const useStreamConfig = () => {
  const streamSettings = ref({
    bitrate: 7340032,  // ~7MB/s
    maxFps: 60,
    iFrameInterval: 10,
    bounds: {
      width: 720,
      height: 720
    },
    sendFrameMeta: false,
    lockedVideoOrientation: -1
  })

  const updateSettings = (newSettings: Partial<typeof streamSettings.value>) => {
    streamSettings.value = {
      ...streamSettings.value,
      ...newSettings
    }
  }

  const setBounds = (width: number, height: number) => {
    streamSettings.value.bounds = {
      width: width & ~15, // Đảm bảo chia hết cho 16
      height: height & ~15
    }
  }

  return {
    streamSettings,
    updateSettings,
    setBounds
  }
}

// Export composable cho stream control
// Export composable cho stream control
export const useStreamControl = (props: {
  udid: string,
  playerName: string,
  ws: string
}) => {
  const isStreaming = ref(false)
  const streamError = ref<string | null>(null)
  const streamRef = ref<InstanceType<typeof StreamH264Converter> | null>(null)

  const startStream = () => {
    if (!streamRef.value) return
    
    try {
      isStreaming.value = true
      streamError.value = null
    } catch (error) {
      streamError.value = error instanceof Error ? error.message : 'Unknown error'
      isStreaming.value = false
    }
  }

  const stopStream = () => {
    if (!streamRef.value) return
    
    try {
      isStreaming.value = false
      // Thay vì gọi stop(), chúng ta sẽ emit event để đóng stream
      streamRef.value.$emit('update:show', false)
    } catch (error) {
      console.error('Error stopping stream:', error)
    }
  }

  // Cleanup khi unmount
  onUnmounted(() => {
    stopStream()
  })

  return {
    isStreaming,
    streamError,
    streamRef,
    startStream,
    stopStream
  }
}

// Export composable for device connection
export const useDeviceConnection = () => {
  const devices = ref<Device[]>([])
  const connectionState = ref<string>("disconnected")
  const deviceService = new DeviceService()
  let cleanup: (() => void) | null = null

  const connect = () => {
    deviceService.connect()
    cleanup = deviceService.onDeviceList((data: DeviceState) => {
      devices.value = data.devices
      connectionState.value = data.state
    })
  }

  const disconnect = () => {
    if (cleanup) {
      cleanup()
    }
    deviceService.disconnect()
  }

  return {
    devices,
    connectionState,
    connect,
    disconnect
  }
}

export const useWebSocketConnection = (url: string) => {
  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)
  let ws: WebSocket | null = null
  let reconnectTimer: NodeJS.Timeout | null = null

  const connect = () => {
    try {
      ws = new WebSocket(url)

      ws.onopen = () => {
        isConnected.value = true
        connectionError.value = null
        if (reconnectTimer) {
          clearTimeout(reconnectTimer)
          reconnectTimer = null
        }
      }

      ws.onclose = () => {
        isConnected.value = false
        // Try to reconnect after 3 seconds
        reconnectTimer = setTimeout(() => {
          connect()
        }, 3000)
      }

      ws.onerror = (error) => {
        connectionError.value = 'Connection error'
        isConnected.value = false
      }

    } catch (error) {
      connectionError.value = error instanceof Error ? error.message : 'Unknown error'
      isConnected.value = false
    }
  }

  const disconnect = () => {
    if (ws) {
      ws.close()
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    isConnected.value = false
  }

  // Auto cleanup on component unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    connectionError,
    connect,
    disconnect
  }
} 