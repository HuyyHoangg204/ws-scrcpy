// src/services/DeviceService.ts
import { getMultiplexWsUrl } from "../config/env";

// Interface define device state
interface DeviceState {
  devices: any[]; // List devices
  state: 'device' | 'disconnected'; // Connection state: connected or disconnected
}

export class DeviceService {
  private ws: WebSocket | null = null; // WebSocket connection
  private deviceListeners: ((state: DeviceState) => void)[] = []; // List of callback functions
  private reconnectTimeout: number | null = null; // Timer for reconnect
  private isConnecting: boolean = false; // Flag for connecting state

  // Method for setting up WebSocket connection
  connect() {
    if (this.isConnecting) return; // Avoid multiple connections
    this.isConnecting = true;

    try {
      // Initialize WebSocket connection to multiplexer server
      this.ws = new WebSocket(getMultiplexWsUrl());

      // Handle event when connection is successful
      this.ws.onopen = () => {
        console.log('DeviceService: WebSocket connection opened');
        this.isConnecting = false;

        // Create message according to protocol to create communication channel:
        // - Byte 0: Message Type (4 = CreateChannel)
        // - Byte 1-4: Channel ID (0)
        // - Byte 5+: Channel Code ("GTRC")
        const messageType = 4; // MessageType.CreateChannel
        const channelId = 0; // Default channel ID
        const channelCode = new TextEncoder().encode("GTRC");

        // Create buffer with correct protocol format
        const buffer = new ArrayBuffer(5 + channelCode.length);
        const view = new DataView(buffer);

        // Write messageType to first byte
        view.setUint8(0, messageType);

        // Write channelId to next 4 bytes
        view.setUint32(1, channelId, true); // true for little-endian

        // Write channel code to remaining bytes
        new Uint8Array(buffer, 5).set(channelCode);

        // Send buffer to server
        if (this.ws) {
          this.ws.send(buffer);
        }
      };

      // Handle messages received from server
      this.ws.onmessage = async (event) => {
        try {
          // Convert Blob data to ArrayBuffer
          const arrayBuffer = await event.data.arrayBuffer();

          // Read header of message (first 5 bytes)
          // const view = new DataView(arrayBuffer);

          // Read and decode JSON data
          const data = arrayBuffer.slice(5); // Skip first 5 bytes header
          const decoder = new TextDecoder();
          const jsonString = decoder.decode(data);

          // Parse JSON and process data
          const deviceData = JSON.parse(jsonString);
          
          // Process 2 types of messages: devicelist and device
          if (deviceData.type === 'devicelist') {
            // Process device list
            const deviceList = deviceData.data?.list || [];
            const device = deviceList[0];
            const state = device?.state || 'disconnected';
            
            // Notify all listeners about new device list
            this.deviceListeners.forEach((listener) => {
              listener({
                devices: deviceList,
                state: state
              });
            });
          } else if (deviceData.type === 'device') {
            // Process specific device information
            const device = deviceData.data?.device;
            const state = device?.state || 'disconnected';
            
            // Notify all listeners about new device information
            this.deviceListeners.forEach((listener) => {
              listener({
                devices: device ? [device] : [],
                state: state
              });
            });
          }
        } catch (e) {
          console.error("Error processing message:", e);
        }
      };

      // Handle connection close event
      this.ws.onclose = () => {
        console.log("Disconnected from server, attempting to reconnect...");
        this.isConnecting = false;
        this.scheduleReconnect(); // Schedule reconnect
      };

      // Handle error event
      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
        this.scheduleReconnect(); // Schedule reconnect
      };
    } catch (error) {
      console.error("Failed to connect:", error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  // Schedule reconnect after 3 seconds
  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, 3000);
  }

  // Register callback to receive device information
  onDeviceList(callback: (state: DeviceState) => void) {
    this.deviceListeners.push(callback);
    // Return cleanup function to unregister callback
    return () => {
      this.deviceListeners = this.deviceListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  // Disconnect WebSocket and clean up
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.deviceListeners = [];
  }
}
