// src/services/DeviceService.ts
import { getWsUrl } from "../config/env";

// Interface defining device state
interface DeviceState {
  devices: any[]; // Device list
  state: 'device' | 'disconnected'; // Connection state: connected or disconnected
}

export class DeviceService {
  private ws: WebSocket | null = null; // WebSocket connection
  private deviceListeners: ((state: DeviceState) => void)[] = []; // List of callback functions
  private reconnectTimeout: number | null = null; // Timer for reconnect
  private isConnecting: boolean = false; // Connection state flag

  // Method for setting up WebSocket connection
  public connect(): void {
    if (this.isConnecting) return; // Avoid multiple connections
    this.isConnecting = true;

    // Initialize WebSocket connection to multiplexer server
    this.ws = new WebSocket(getWsUrl());

    // Handle event when connection is successful
    this.ws.onopen = () => {
      this.isConnecting = false;

      // Create message according to protocol to create communication channel:
      // - Byte 0: Message Type (4 = CreateChannel)
      // - Byte 1-4: Channel ID (0)
      // - Byte 5+: Channel Code ("GTRC")
      const messageType = 4; // MessageType.CreateChannel
      const channelId = 0; // Default channel ID
      const channelCode = "GTRC";

      // Create buffer with correct protocol format
      const buffer = new ArrayBuffer(5 + channelCode.length);
      const view = new DataView(buffer);

      // Write messageType to first byte
      view.setUint8(0, messageType);

      // Write channelId to next 4 bytes
      view.setUint32(1, channelId, true); // true for little-endian

      // Write channel code to remaining bytes
      const encoder = new TextEncoder();
      const channelCodeBytes = encoder.encode(channelCode);
      new Uint8Array(buffer).set(channelCodeBytes, 5);

      // Send buffer to server
      if (this.ws) {
        this.ws.send(buffer);
      }
    };

    // Handle messages received from server
    this.ws.onmessage = async (event: MessageEvent) => {
      // Convert Blob data to ArrayBuffer
      const arrayBuffer = await event.data.arrayBuffer();

      // Read header of message (first 5 bytes)
      const header = arrayBuffer.slice(0, 5);

      // Read and decode JSON data
      const data = arrayBuffer.slice(5); // Skip first 5 bytes header
      const decoder = new TextDecoder();
      const jsonStr = decoder.decode(data);

      // Parse JSON and process data
      const message = JSON.parse(jsonStr);

      // Process 2 types of messages: devicelist and device
      if (message.type === "devicelist") {
        // Process device list
        const deviceState: DeviceState = {
          devices: message.data,
          state: message.data[0]?.state || "disconnected",
        };

        // Notify all listeners about new device list
        this.deviceListeners.forEach((listener) => {
          listener(deviceState);
        });
      } else if (message.type === "device") {
        // Process specific device information
        const deviceState: DeviceState = {
          devices: [message.data],
          state: message.data.state,
        };

        // Notify all listeners about new device information
        this.deviceListeners.forEach((listener) => {
          listener(deviceState);
        });
      }
    };

    // Handle connection close event
    this.ws.onclose = () => {
      this.isConnecting = false;
      this.ws = null;
      this.scheduleReconnect(); // Schedule reconnect
    };

    // Handle error event
    this.ws.onerror = () => {
      this.isConnecting = false;
      this.ws = null;
      this.scheduleReconnect(); // Schedule reconnect
    };
  }

  private scheduleReconnect(): void {
    // Schedule reconnect after 3 seconds
    if (this.reconnectTimeout === null) {
      this.reconnectTimeout = window.setTimeout(() => {
        this.reconnectTimeout = null;
        this.connect();
      }, 3000);
    }
  }

  // Register callback to receive device information
  public onDeviceList(callback: (state: DeviceState) => void): () => void {
    this.deviceListeners.push(callback);

    // Return cleanup function to unregister callback
    return () => {
      const index = this.deviceListeners.indexOf(callback);
      if (index !== -1) {
        this.deviceListeners.splice(index, 1);
      }
    };
  }

  // Disconnect WebSocket and clean up
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.deviceListeners = [];
  }
}
