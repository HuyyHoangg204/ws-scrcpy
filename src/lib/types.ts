// Network interface information
export interface NetworkInterface {
  name: string;
  ipv4: string;
}

// Device information
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

// Device connection state
export interface DeviceState {
  devices: Device[];
  state: "device" | "disconnected";
}

// Props for AndroidDeviceDialog component
export interface AndroidDeviceDialogProps {
  visible: boolean;
  device: Device | null;
  wsUrl?: string;
} 